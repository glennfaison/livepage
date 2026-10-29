#!/usr/bin/env node
// Points git at the tracked hooks in scripts/git-hooks.
//
// `core.hooksPath` is local git config. Git does not copy it on clone, so a
// hook that relies on someone running `git config` by hand is silently skipped
// in every fresh clone, worktree checkout, and agent sandbox. The npm `prepare`
// script runs this file on every `npm install` and `npm ci` instead.
//
//   node scripts/setup-git-hooks.mjs             install (never fails the install)
//   node scripts/setup-git-hooks.mjs --check     verify; exit 1 when hooks would not run
//   node scripts/setup-git-hooks.mjs --self-test
import { spawnSync } from "node:child_process"
import { chmodSync, existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

export const HOOKS_DIR = "scripts/git-hooks"
export const REQUIRED_HOOKS = ["pre-commit", "commit-msg", "pre-push"]

const EXECUTABLE_MODE = "100755"
const IS_WINDOWS = process.platform === "win32"

function git(args, cwd) {
  // Never inherit GIT_DIR / GIT_INDEX_FILE: they would redirect these commands
  // to whichever repository an outer git process is working on.
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")))
  const result = spawnSync("git", args, { cwd, env, encoding: "utf8" })
  return { ok: result.status === 0, stdout: (result.stdout ?? "").trim(), stderr: (result.stderr ?? "").trim() }
}

function sameDirectory(a, b) {
  try {
    return realpathSync(a) === realpathSync(b)
  } catch {
    return false
  }
}

/** The git work tree root that `root` is the top of, or null when `root` is not a repository root. */
function repositoryRoot(root) {
  const top = git(["rev-parse", "--show-toplevel"], root)
  if (!top.ok || !top.stdout) return null
  // A git dependency or monorepo package installs inside someone else's
  // repository. Never rewrite that repository's hook configuration.
  return sameDirectory(top.stdout, root) ? top.stdout : null
}

export function installGitHooks(root) {
  if (!repositoryRoot(root)) {
    return { status: "skipped", message: "not the root of a git checkout; git hooks not installed" }
  }
  const previous = git(["config", "--local", "--get", "core.hooksPath"], root).stdout
  const set = git(["config", "--local", "core.hooksPath", HOOKS_DIR], root)
  if (!set.ok) {
    return { status: "failed", message: `could not set core.hooksPath: ${set.stderr}` }
  }
  // Archives and zip imports drop the executable bit, and git then skips a
  // non-executable hook without any error.
  for (const hook of REQUIRED_HOOKS) {
    const file = path.join(root, HOOKS_DIR, hook)
    if (existsSync(file)) chmodSync(file, 0o755)
  }
  const changed = previous !== HOOKS_DIR
  return {
    status: changed ? "installed" : "unchanged",
    message: changed
      ? `git hooks enabled (core.hooksPath=${HOOKS_DIR}${previous ? `, was ${previous}` : ""})`
      : "git hooks already enabled",
  }
}

/** Returns a list of problems that would stop the hooks from running. Empty means healthy. */
export function checkGitHooks(root) {
  if (!repositoryRoot(root)) return ["not the root of a git checkout, so there are no hooks to check"]
  const problems = []
  const effective = git(["rev-parse", "--git-path", "hooks"], root).stdout
  if (!effective || !sameDirectory(path.resolve(root, effective), path.join(root, HOOKS_DIR))) {
    problems.push(`git is not using ${HOOKS_DIR} (hooks directory in effect: ${effective || "unknown"})`)
  }
  for (const hook of REQUIRED_HOOKS) {
    const file = path.join(root, HOOKS_DIR, hook)
    if (!existsSync(file)) {
      problems.push(`${HOOKS_DIR}/${hook} is missing`)
      continue
    }
    if (!IS_WINDOWS && (statSync(file).mode & 0o111) === 0) {
      problems.push(`${HOOKS_DIR}/${hook} is not executable, so git skips it`)
    }
    const tracked = git(["ls-files", "-s", "--", `${HOOKS_DIR}/${hook}`], root).stdout
    const mode = tracked.split(/\s+/)[0]
    if (!tracked) problems.push(`${HOOKS_DIR}/${hook} is not tracked by git`)
    else if (mode !== EXECUTABLE_MODE) {
      problems.push(`${HOOKS_DIR}/${hook} is committed with mode ${mode}; run: git update-index --chmod=+x ${HOOKS_DIR}/${hook}`)
    }
  }
  return problems
}

function selfTest() {
  const assert = (condition, message) => {
    if (!condition) throw new Error(`setup-git-hooks self-test failed: ${message}`)
  }
  const tmp = realpathSync(mkdtempSync(path.join(os.tmpdir(), "livepage-hooks-")))
  try {
    git(["init", "-q"], tmp)
    mkdirSync(path.join(tmp, HOOKS_DIR), { recursive: true })
    for (const hook of REQUIRED_HOOKS) {
      writeFileSync(path.join(tmp, HOOKS_DIR, hook), "#!/bin/sh\nexit 0\n", { mode: 0o644 })
    }

    assert(checkGitHooks(tmp).some((p) => p.includes("not using")), "fresh clone must be reported as not enabled")

    const first = installGitHooks(tmp)
    assert(first.status === "installed", `first install should report installed, got ${first.status}`)
    assert(installGitHooks(tmp).status === "unchanged", "second install must be a no-op")

    for (const hook of REQUIRED_HOOKS) git(["add", `${HOOKS_DIR}/${hook}`], tmp)
    const afterInstall = checkGitHooks(tmp)
    assert(afterInstall.length === 0, `healthy checkout reported problems: ${afterInstall.join("; ")}`)

    git(["update-index", "--chmod=-x", `${HOOKS_DIR}/pre-commit`], tmp)
    assert(checkGitHooks(tmp).some((p) => p.includes("committed with mode")), "non-executable committed hook must be caught")
    git(["update-index", "--chmod=+x", `${HOOKS_DIR}/pre-commit`], tmp)

    // A package nested in someone else's repository must not change that repository.
    const nested = path.join(tmp, "node_modules", "dep")
    mkdirSync(nested, { recursive: true })
    git(["config", "--local", "--unset", "core.hooksPath"], tmp)
    assert(installGitHooks(nested).status === "skipped", "nested package must be skipped")
    assert(git(["config", "--local", "--get", "core.hooksPath"], tmp).stdout === "", "nested install must not touch the parent repository")
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
  console.log("git hooks setup self-test passed")
}

function main(argv) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
  if (argv.includes("--self-test")) {
    selfTest()
    return 0
  }
  if (argv.includes("--check")) {
    const problems = checkGitHooks(root)
    if (problems.length === 0) {
      console.log("git hooks are enabled and executable")
      return 0
    }
    console.error("git hooks would not run:")
    for (const problem of problems) console.error(`  - ${problem}`)
    console.error("Fix: npm run setup:hooks")
    return 1
  }
  // Install mode must never break `npm install`: report and exit 0.
  try {
    const result = installGitHooks(root)
    if (result.status !== "unchanged") console.log(`[git-hooks] ${result.message}`)
  } catch (error) {
    console.warn(`[git-hooks] could not install git hooks: ${error instanceof Error ? error.message : error}`)
    console.warn("[git-hooks] run `npm run setup:hooks` once the problem is fixed")
  }
  return 0
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)))
}
