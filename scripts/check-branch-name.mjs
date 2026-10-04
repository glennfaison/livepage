#!/usr/bin/env node
import { spawnSync } from "node:child_process"

const GITFLOW_BRANCH_PATTERN =
  /^(?:main|develop|(?:feature|hotfix|bugfix)\/[a-z0-9]+(?:-[a-z0-9]+)*|release\/\d+(?:\.\d+)*|support\/\d+(?:\.\d+)*(?:\.x|x)?)$/

export const ALLOWED_BRANCH_PATTERNS = [
  "main",
  "develop",
  "feature/<topic>",
  "release/<version>",
  "hotfix/<topic>",
  "support/<version-line>",
  "bugfix/<topic>",
]

const EXAMPLES = [
  "feature/login-flow",
  "release/1.4.0",
  "hotfix/crash-on-start",
  "support/1.x",
  "bugfix/null-deref",
]

export function isGitflowBranchName(branchName) {
  return GITFLOW_BRANCH_PATTERN.test(branchName)
}

export function branchNameError(branchName) {
  return [
    `Branch name "${branchName}" does not follow gitflow.`,
    "Allowed patterns (topic and version segments are lowercase kebab-case):",
    ...ALLOWED_BRANCH_PATTERNS.map((pattern) => `  - ${pattern}`),
    "Examples:",
    ...EXAMPLES.map((example) => `  - ${example}`),
    "Rename the branch and push again. This rule applies to humans, agents, and automation.",
  ].join("\n")
}

export function normalizeBranchRef(ref) {
  if (!ref) return ""
  return ref.replace(/^refs\/heads\//, "").replace(/^refs\/remotes\/origin\//, "")
}

function assertBranchName(branchName) {
  if (!branchName) {
    throw new Error("No branch name to validate. Pass a name, or run inside a checkout.")
  }
  if (!isGitflowBranchName(branchName)) {
    throw new Error(branchNameError(branchName))
  }
}

function selfTest() {
  const accepted = [
    "main",
    "develop",
    "feature/login-flow",
    "feature/add-dark-mode",
    "release/1.4.0",
    "release/2",
    "hotfix/crash-on-start",
    "support/1.x",
    "support/1.4.x",
    "bugfix/null-deref",
  ]
  const rejected = [
    "Feature/login",
    "feature/Login_Flow",
    "feature/",
    "fix/null-deref",
    "templates/landing",
    "cursor/add-tab",
    "release/v1.4.0",
    "support/one",
  ]

  for (const name of accepted) {
    if (!isGitflowBranchName(name)) throw new Error(`Expected ${name} to be accepted.`)
  }
  for (const name of rejected) {
    if (isGitflowBranchName(name)) throw new Error(`Expected ${name} to be rejected.`)
  }
  if (!branchNameError("fix/oops").includes("feature/<topic>")) {
    throw new Error("Rejection message must list the expected patterns.")
  }
  console.log("gitflow branch-name self-test passed")
}

function readBranchFromGit() {
  const result = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { encoding: "utf8" })
  if (result.status !== 0) return ""
  const name = result.stdout.trim()
  return name === "HEAD" ? "" : name
}

function currentBranchName(argv) {
  const flagIndex = argv.indexOf("--branch")
  if (flagIndex !== -1 && argv[flagIndex + 1]) return argv[flagIndex + 1]
  if (process.env.GITHUB_HEAD_REF) return process.env.GITHUB_HEAD_REF
  if (process.env.GITHUB_REF_NAME && process.env.GITHUB_REF_TYPE === "branch") {
    return process.env.GITHUB_REF_NAME
  }
  return readBranchFromGit()
}

function main() {
  const argv = process.argv.slice(2)
  if (argv.includes("--self-test")) {
    selfTest()
    return
  }
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log("Usage: node scripts/check-branch-name.mjs [--branch <name>] [--self-test]")
    return
  }
  const branchName = normalizeBranchRef(currentBranchName(argv))
  assertBranchName(branchName)
  console.log(`Branch name ${branchName} matches gitflow.`)
}

const isDirectRun = process.argv[1] && process.argv[1].endsWith("check-branch-name.mjs")
if (isDirectRun) {
  try {
    main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
