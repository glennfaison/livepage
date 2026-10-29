#!/usr/bin/env node
// Pre-commit lint: runs ESLint on the files this commit modifies.
//
// It lints the staged blob (`git show :path`), not the working-tree file, so a
// partially staged file is judged on what will actually be committed. It only
// reports; it never rewrites files or the index. Warnings fail too: the project
// is clean today and this keeps it that way.
//
//   node scripts/lint-staged.mjs
//   node scripts/lint-staged.mjs --self-test
import { spawnSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const LINTABLE_EXTENSION = /\.[cm]?[jt]sx?$/

export function selectLintableFiles(paths) {
  return paths.filter((file) => LINTABLE_EXTENSION.test(file))
}

// Do not strip GIT_* here: during `git commit -a` or `git commit <path>` git
// points the hook at a temporary index through GIT_INDEX_FILE.
function git(args, cwd, { raw = false } = {}) {
  const result = spawnSync("git", args, { cwd, encoding: raw ? "buffer" : "utf8", maxBuffer: 64 * 1024 * 1024 })
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${String(result.stderr ?? "").trim()}`)
  }
  return result.stdout
}

function stagedFiles(root) {
  const output = git(["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"], root)
  return output.split("\0").filter(Boolean)
}

export async function lintStaged(root) {
  const files = selectLintableFiles(stagedFiles(root))
  if (files.length === 0) return 0

  let ESLint
  try {
    ;({ ESLint } = await import("eslint"))
  } catch {
    console.error("pre-commit: ESLint is not installed. Run `npm ci`, then commit again.")
    return 1
  }

  const eslint = new ESLint({ cwd: root })
  const results = []
  for (const file of files) {
    const source = git(["show", `:${file}`], root, { raw: true }).toString("utf8")
    const [result] = await eslint.lintText(source, { filePath: path.join(root, file), warnIgnored: false })
    if (result) results.push(result)
  }

  const problemCount = results.reduce((sum, result) => sum + result.errorCount + result.warningCount, 0)
  if (problemCount === 0) {
    console.log(`pre-commit: ESLint passed for ${files.length} staged file${files.length === 1 ? "" : "s"}`)
    return 0
  }

  const formatter = await eslint.loadFormatter("stylish")
  console.error(await formatter.format(results))
  console.error(`pre-commit: ${problemCount} lint problem${problemCount === 1 ? "" : "s"} in the staged changes; commit aborted.`)
  console.error("Fix them, `git add` the files, and commit again. `npx eslint --fix <file>` handles the auto-fixable ones.")
  return 1
}

function selfTest() {
  const assert = (condition, message) => {
    if (!condition) throw new Error(`lint-staged self-test failed: ${message}`)
  }
  const selected = selectLintableFiles([
    "client/a.ts",
    "client/b.tsx",
    "scripts/c.mjs",
    "scripts/d.cjs",
    "app/e.js",
    "app/f.jsx",
    "README.md",
    "package.json",
    "public/logo.svg",
    "client/notes.ts.md",
  ])
  assert(
    JSON.stringify(selected) === JSON.stringify(["client/a.ts", "client/b.tsx", "scripts/c.mjs", "scripts/d.cjs", "app/e.js", "app/f.jsx"]),
    `unexpected selection: ${selected.join(", ")}`,
  )
  console.log("lint-staged self-test passed")
}

async function main(argv) {
  if (argv.includes("--self-test")) {
    selfTest()
    return 0
  }
  const root = git(["rev-parse", "--show-toplevel"], process.cwd()).trim()
  return lintStaged(root)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (error) => {
      console.error(`pre-commit: ${error instanceof Error ? error.message : error}`)
      process.exit(1)
    },
  )
}
