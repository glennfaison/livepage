# Agent guidance

Before changing code, read the [project context](./.agents/docs/CONTEXT.md),
[conventions](./.agents/docs/CONVENTIONS.md),
[agent workflow](./.agents/docs/AGENT-WORKFLOW.md),
[glossary](./.agents/docs/GLOSSARY.md), relevant [ADRs](./.agents/docs/adr/), the
[README](./README.md), and authoritative scripts in [package.json](./package.json).

## Branch naming (gitflow)

All branches must match one of these patterns. CI fails otherwise.

| Type | Pattern | Example |
| --- | --- | --- |
| main | `main` | `main` |
| develop | `develop` | `develop` |
| feature | `feature/<topic>` | `feature/login-flow` |
| release | `release/<version>` | `release/1.4.0` |
| hotfix | `hotfix/<topic>` | `hotfix/crash-on-start` |
| support | `support/<version-line>` | `support/1.x` |
| bugfix | `bugfix/<topic>` | `bugfix/null-deref` |

Topic and version segments must be lowercase kebab-case (alphanumerics and hyphens; versions may include dots). Create branches with a matching name from the start — do not rely on renaming later.

Enforcement today is a GitHub Actions job (`.github/workflows/branch-name.yml`). A repository ruleset that rejects invalid ref names at push time is a maintainer follow-up (requires admin settings).

## Skills

All skills live in [.agents/skills/](./.agents/skills/). Invoke `/ask-glenn` to
find the right skill, then read its `SKILL.md` before following its workflow.
