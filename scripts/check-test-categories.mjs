#!/usr/bin/env node
// Fails when a Jest test file lives outside a known category, because the
// per-category CI jobs would never run it. See .agents/docs/TESTING.md.
import { execSync } from "node:child_process"
import path from "node:path"

const categories = [
  ["smoke", /^__tests__\/smoke\//],
  ["unit", /^(__tests__\/unit|client)\//],
  ["component", /^(__tests__\/(components|integration)\/|__tests__\/contrast-color\.test\.ts$)/],
]

const root = process.cwd()
const files = execSync("npx jest --listTests", { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .map((file) => path.relative(root, file).split(path.sep).join("/"))

const orphans = files.filter((file) => !categories.some(([, pattern]) => pattern.test(file)))
if (orphans.length > 0) {
  console.error("Jest tests outside a category (move them under one, see .agents/docs/TESTING.md):")
  for (const file of orphans) console.error(`  ${file}`)
  process.exit(1)
}
console.log(`All ${files.length} Jest test files belong to a category.`)
