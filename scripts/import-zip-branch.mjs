#!/usr/bin/env node
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

function printUsage() {
  console.log(`Usage: node scripts/import-zip-branch.mjs <archive.zip> [--branch <name>]`)
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: options.stdio ?? "pipe",
    encoding: "utf8",
    cwd: options.cwd,
  })

  if (options.stdio === "inherit" && result.stdout) {
    process.stdout.write(result.stdout)
  }
  if (options.stdio === "inherit" && result.stderr) {
    process.stderr.write(result.stderr)
  }

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0 && options.allowFailure !== true) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}.`)
  }

  return result
}

function parseArgs(argv) {
  const args = { archive: undefined, branch: undefined }

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === "--help" || value === "-h") {
      printUsage()
      process.exit(0)
    }
    if (value === "--branch") {
      args.branch = argv[index + 1]
      if (!args.branch || args.branch.startsWith("-")) {
        throw new Error("--branch requires a branch name.")
      }
      index += 1
      continue
    }
    if (!value.startsWith("-")) {
      if (!args.archive) {
        args.archive = value
      }
      continue
    }
    throw new Error(`Unknown argument: ${value}`)
  }

  if (!args.archive) {
    throw new Error("An archive path is required.")
  }

  return args
}

function git(command, args, options = {}) {
  return run("git", [command, ...args], {
    cwd: options.cwd ?? process.cwd(),
    stdio: options.stdio ?? "pipe",
    allowFailure: options.allowFailure,
  })
}

function normalizeArchivePath(relativePath) {
  const normalized = relativePath.split("\\").join("/")
  const segments = normalized.split("/")

  if (normalized.startsWith("/") || /^[a-zA-Z]:/.test(normalized) || segments.includes("..")) {
    throw new Error(`Unsafe path in archive: ${relativePath}`)
  }

  while (segments[0] === "" || segments[0] === ".") {
    segments.shift()
  }
  return segments.join("/")
}

function stripLeadingFolder(relativePath) {
  const segments = normalizeArchivePath(relativePath).split("/").filter(Boolean)
  if (["files", "patches", "archive"].includes(segments[0])) {
    return segments.slice(1).join("/")
  }
  return segments.join("/")
}

function inferBranchName(patchFilePath, extractedDir) {
  const patchName = path.basename(patchFilePath).replace(/\.patch$/i, "")
  const normalized = patchName
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()

  if (normalized) {
    const maybeTemplate = normalized.includes("landing-page") || normalized.includes("template")
    if (maybeTemplate) {
      return `templates/${normalized}`
    }
    return `feature/${normalized}`
  }

  const candidatePaths = []
  walkDirectory(extractedDir, candidatePaths)
  const match = candidatePaths.find((entry) => entry.toLowerCase().includes("landing-page")) || candidatePaths.find((entry) => entry.toLowerCase().includes("template"))
  if (match) {
    return `templates/${path.basename(match).replace(/\.[^.]+$/, "").replace(/[^a-z0-9-]/gi, "-").toLowerCase()}`
  }

  return "feature/import-from-zip"
}

function walkDirectory(dir, results) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isSymbolicLink()) {
      throw new Error(`Symbolic links are not supported in the archive: ${fullPath}`)
    }
    if (entry.isDirectory()) {
      walkDirectory(fullPath, results)
      continue
    }
    if (!entry.isFile()) {
      continue
    }
    results.push(fullPath)
  }
}

function findPatchFile(extractedDir) {
  const matches = []
  walkDirectory(extractedDir, matches)
  const patchFile = matches.filter((entry) => entry.toLowerCase().endsWith(".patch")).sort((a, b) => a.length - b.length)[0]
  if (!patchFile) {
    throw new Error("No .patch file was found in the archive.")
  }
  return patchFile
}

function ensureRepoClean(repoRoot) {
  const status = git("status", ["--porcelain"], { cwd: repoRoot, stdio: "pipe" })
  if (status.stdout.trim()) {
    throw new Error("Repository has uncommitted changes. Commit or stash them before importing.")
  }
}

function listPatchDestinations(patchFile) {
  const patch = fs.readFileSync(patchFile, "utf8")
  const destinations = new Set()
  for (const match of patch.matchAll(/^\+\+\+ b\/(.+)$/gm)) {
    const destination = normalizeArchivePath(match[1])
    if (!destination || destination.startsWith(".git/")) {
      throw new Error(`Invalid destination in patch: ${match[1]}`)
    }
    destinations.add(destination)
  }
  if (destinations.size === 0) {
    throw new Error("The patch does not contain any destination paths.")
  }
  return destinations
}

function resolveAssetDestination(relativePath, patchDestinations) {
  const normalized = stripLeadingFolder(relativePath)
  if (!normalized) return undefined

  if (patchDestinations.has(normalized)) {
    return normalized
  }

  const basename = path.posix.basename(normalized)
  const basenameMatches = [...patchDestinations].filter((destination) => path.posix.basename(destination) === basename)
  if (basenameMatches.length === 1) {
    return basenameMatches[0]
  }
  if (basenameMatches.length > 1) {
    throw new Error(`Archive asset "${relativePath}" matches multiple patch destinations: ${basenameMatches.join(", ")}`)
  }

  throw new Error(`Archive asset "${relativePath}" has no matching destination in the patch.`)
}

function collectArchiveAssets(extractedDir, patchFile, patchDestinations) {
  const candidates = []
  walkDirectory(extractedDir, candidates)
  const assets = []

  for (const absolute of candidates) {
    const relative = path.relative(extractedDir, absolute)
    const normalized = normalizeArchivePath(relative)
    if (normalized === "__MACOSX" || normalized.startsWith("__MACOSX/") || normalized.startsWith(".DS_Store")) continue
    if (absolute === patchFile || normalized.toLowerCase().endsWith(".patch")) continue

    const destination = resolveAssetDestination(normalized, patchDestinations)
    if (destination) assets.push({ source: absolute, destination })
  }
  return assets
}

function copyArchiveAssets(assets, repoRoot) {
  const changedDestinations = []
  for (const asset of assets) {
    const destination = path.resolve(repoRoot, asset.destination)
    if (!destination.startsWith(`${repoRoot}${path.sep}`)) {
      throw new Error(`Archive asset destination escapes the repository: ${asset.destination}`)
    }
    fs.mkdirSync(path.dirname(destination), { recursive: true })
    if (!fs.existsSync(destination) || !fs.readFileSync(asset.source).equals(fs.readFileSync(destination))) {
      fs.copyFileSync(asset.source, destination)
      changedDestinations.push(asset.destination)
    }
  }
  return changedDestinations
}

function checkoutBranch(repoRoot, branchName) {
  const validation = git("check-ref-format", ["--branch", branchName], {
    cwd: repoRoot,
    allowFailure: true,
  })
  if (validation.status !== 0) {
    throw new Error(`Invalid branch name: ${branchName}`)
  }

  const exists = git("show-ref", ["--verify", "--quiet", `refs/heads/${branchName}`], {
    cwd: repoRoot,
    allowFailure: true,
  })
  git("checkout", [exists.status === 0 ? branchName : "-b", ...(exists.status === 0 ? [] : [branchName])], {
    cwd: repoRoot,
    stdio: "inherit",
  })
}

function commitChangedAssets(repoRoot, changedDestinations) {
  if (changedDestinations.length === 0) return
  git("add", ["--", ...changedDestinations], { cwd: repoRoot, stdio: "inherit" })
  git("commit", ["-m", "Add assets from zip archive"], { cwd: repoRoot, stdio: "inherit" })
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2))
    const archivePath = path.resolve(args.archive)
    if (!fs.existsSync(archivePath)) {
      throw new Error(`Archive not found: ${archivePath}`)
    }

    const repoRoot = git("rev-parse", ["--show-toplevel"], { stdio: "pipe" }).stdout.trim()
    if (!repoRoot) {
      throw new Error("This script must be run inside a git repository.")
    }

    ensureRepoClean(repoRoot)

    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "zip-import-"))
    try {
      const archiveEntries = run("unzip", ["-Z1", archivePath]).stdout
        .split(/\r?\n/)
        .filter(Boolean)
      if (archiveEntries.length === 0) {
        throw new Error("The archive is empty.")
      }
      for (const entry of archiveEntries) {
        normalizeArchivePath(entry)
      }
      run("unzip", ["-q", "-o", archivePath, "-d", tempRoot], { stdio: "inherit" })

      const patchFile = findPatchFile(tempRoot)
      const patchDestinations = listPatchDestinations(patchFile)
      const assets = collectArchiveAssets(tempRoot, patchFile, patchDestinations)
      const branchName = args.branch || inferBranchName(patchFile, tempRoot)

      checkoutBranch(repoRoot, branchName)

      const result = git("am", ["--3way", "--keep-cr", patchFile], {
        cwd: repoRoot,
        stdio: "inherit",
        allowFailure: true,
      })
      if (result.status !== 0) {
        throw new Error("git am failed. Resolve the conflicts and run git am --continue or git am --abort.")
      }
      const changedDestinations = copyArchiveAssets(assets, repoRoot)
      commitChangedAssets(repoRoot, changedDestinations)

      console.log(`Imported ${archivePath} onto branch ${branchName}.`)
      console.log(`Patch applied from: ${patchFile}`)
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true })
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}

main()
