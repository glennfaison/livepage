# Branch names

Every branch in this repository must use a gitflow name. The rule is the same for a person, an agent, or a bot.

| Branch type | Pattern | Examples |
| --- | --- | --- |
| main | `main` | `main` |
| develop | `develop` | `develop` |
| feature | `feature/<topic>` | `feature/login-flow` |
| release | `release/<version>` | `release/1.4.0` |
| hotfix | `hotfix/<topic>` | `hotfix/crash-on-start` |
| support | `support/<version-line>` | `support/1.x` |
| bugfix | `bugfix/<topic>` | `bugfix/null-deref` |

Topic segments are lowercase kebab-case: letters, digits, and hyphens only. Version segments are numeric (`1`, `1.4`, `1.4.0`). Support lines may end in `x` (`support/1.x`).

## Enforcement

1. **CI (required backstop, runs first).** `.github/workflows/branch-name.yml` runs `node scripts/check-branch-name.mjs` on every push and pull request. On a pull request it validates `GITHUB_HEAD_REF`. A failing name prints the allowed patterns and examples. This runs for every actor that opens a pull request. The check runs as the first job in CI, before any tests or other validation.
2. **GitHub ruleset (push-time rejection).** A repository ruleset with a `branch_name_pattern` rule is the only check that rejects the push itself, including branches that never become a pull request. It is configured as an active branch ruleset targeting `~ALL` (exclude `refs/heads/dependabot/**`) with operator `regex` and pattern `^(main|develop|(feature|hotfix|bugfix)/[a-z0-9]+(-[a-z0-9]+)*|release/[0-9]+(\.[0-9]+)*|support/[0-9]+(\.[0-9]+)*(\.x|x)?)$`.
3. **Local commit-msg hook (advisory, runs on every commit).** `scripts/git-hooks/commit-msg` checks the branch name on every commit. Enable it with `git config core.hooksPath scripts/git-hooks`. It catches violations before any push.
4. **Local pre-push hook (advisory).** `scripts/git-hooks/pre-push` checks the branch before it leaves the machine. Enable it with `git config core.hooksPath scripts/git-hooks`. It can be skipped and does not cover every agent.

Rename a rejected branch with `git branch -m feature/<topic>` and push that ref.
