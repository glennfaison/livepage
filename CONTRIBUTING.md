# Contributing

Thank you for considering contributing to LivePage.

## Branch naming (gitflow)

All branches in this repository must follow the [gitflow naming conventions](https://david-wheeler.github.io/2010/08/24/git-flow-considered-harmful.html#the-bad-parts-of-gitflow), so that branches and pull requests stay uniform and predictable no matter who or what creates them — a human, a coding agent, or automation.

### Allowed branch names

| Branch type | Pattern | Examples |
| --- | --- | --- |
| main | `main` | `main` |
| develop | `develop` | `develop` |
| feature | `feature/<topic>` | `feature/add-dark-mode` |
| release | `release/<version>` | `release/1.4.0` |
| hotfix | `hotfix/<topic>` | `hotfix/crash-on-start` |
| support | `support/<version-line>` | `support/1.x` |
| bugfix | `bugfix/<topic>` | `bugfix/null-deref` |

Rules:

- The `<topic>` and `<version>` segments must be **lowercase kebab-case**: lowercase letters, digits, and hyphens only.
- No spaces, uppercase letters, underscores, or other separators.
- A branch must match exactly one of the patterns above; anything else is rejected.

### Why

Enforcement is agent-agnostic: it does not depend on any individual contributor or tool remembering the convention. The branch name is validated mechanically at push time and in CI, so the same rules apply whether the branch was opened by hand, by an agent, or by a pipeline. Keeping names uniform makes it easy to find related branches, automate merges, and tell at a glance what each branch is for.

See [issue #76](https://github.com/glennfaison/livepage/issues/76) for the full enforcement plan.

## Opening a pull request

- Create your branch on the appropriate base branch (`main` or `develop`) using one of the allowed names above.
- Fill in the pull request template in [`.github/pull_request_template.md`](./.github/pull_request_template.md).
- Make sure `npm run lint` and `npm test` pass locally before opening the PR.
