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

export function prSourceBranchError(baseRef, headRef) {
  if (baseRef === "main" && headRef !== "develop") {
    return [
      `PRs into main must originate from develop.`,
      `This PR originates from ${headRef}.`,
    ].join("\n")
  }
  if (baseRef === "develop") {
    if (headRef === "main" || headRef === "develop") {
      return [
        `PRs into develop must originate from a gitflow branch.`,
        `This PR originates from ${headRef}, which is not allowed.`,
      ].join("\n")
    }
    if (!isGitflowBranchName(headRef)) {
      return [
        `PRs into develop must originate from a gitflow branch.`,
        `This PR originates from ${headRef}, which does not follow gitflow.`,
        ...branchNameError(headRef).split("\n").map((line) => `  ${line}`),
      ].join("\n")
    }
  }
  return ""
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

  if (prSourceBranchError("main", "feature/login") !== "PRs into main must originate from develop.\nThis PR originates from feature/login.") {
    throw new Error("Unexpected main source branch error.")
  }
  if (prSourceBranchError("develop", "main") !== "PRs into develop must originate from a gitflow branch.\nThis PR originates from main, which is not allowed.") {
    throw new Error("Unexpected develop main source branch error.")
  }
  if (prSourceBranchError("develop", "develop") !== "PRs into develop must originate from a gitflow branch.\nThis PR originates from develop, which is not allowed.") {
    throw new Error("Unexpected develop develop source branch error.")
  }
  if (prSourceBranchError("develop", "fix/login") !== "PRs into develop must originate from a gitflow branch.\nThis PR originates from fix/login, which does not follow gitflow.\n  Branch name \"fix/login\" does not follow gitflow.\n  Allowed patterns (topic and version segments are lowercase kebab-case):\n    - main\n    - develop\n    - feature/<topic>\n    - release/<version>\n    - hotfix/<topic>\n    - support/<version-line>\n    - bugfix/<topic>\n  Examples:\n    - feature/login-flow\n    - release/1.4.0\n    - hotfix/crash-on-start\n    - support/1.x\n    - bugfix/null-deref\n  Rename the branch and push again. This rule applies to humans, agents, and automation.") {
    throw new Error("Unexpected develop non-gitflow source branch error.")
  }
  if (prSourceBranchError("main", "develop") !== "") {
    throw new Error("Expected develop into main to be allowed.")
  }
  if (prSourceBranchError("develop", "feature/login") !== "") {
    throw new Error("Expected feature branch into develop to be allowed.")
  }
  if (prSourceBranchError("feature/login", "develop") !== "") {
    throw new Error("Expected unrelated base branch to be allowed.")
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
    console.log("Usage: node scripts/check-branch-name.mjs [--branch <name>] [--self-test] [--pr-source-branch --base <ref> --head <ref>]")
    return
  }
  if (argv.includes("--pr-source-branch")) {
    const baseRef = normalizeBranchRef(
      argv[argv.indexOf("--base") + 1] || process.env.GITHUB_BASE_REF || ""
    )
    const headRef = normalizeBranchRef(
      argv[argv.indexOf("--head") + 1] || process.env.GITHUB_HEAD_REF || ""
    )
    if (!baseRef || !headRef) {
      throw new Error("Missing --base or --head ref for PR source branch validation.")
    }
    const error = prSourceBranchError(baseRef, headRef)
    if (error) {
      throw new Error(error)
    }
    console.log(`PR source branch ${headRef} is allowed to merge into ${baseRef}.`)
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
