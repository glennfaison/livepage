# Branch names

Every branch in this repository must use a gitflow name. The rule is mechanical: it does not depend on which person, agent, or bot creates the branch.

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

1. **GitHub ruleset (primary).** Creating a branch whose name does not match the patterns is rejected by GitHub. That covers `git push`, agent CLIs, and PR bots. GitHub-managed `dependabot/**` refs are excluded so security-update branches GitHub itself creates are not blocked.
2. **CI.** `.github/workflows/branch-name.yml` runs `node scripts/check-branch-name.mjs` on every push and pull request. On a pull request it validates `GITHUB_HEAD_REF`.
3. **Local pre-push hook (advisory).** `scripts/git-hooks/pre-push` checks the branch before it leaves the machine. Enable it with `git config core.hooksPath scripts/git-hooks`. It can be skipped and does not cover every agent, so it is not the source of truth.

A rejected name prints the allowed patterns and examples. Rename with `git branch -m feature/<topic>` and push that ref.
