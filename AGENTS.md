# Agent guidance

Before changing code, read the [project context](./.agents/docs/CONTEXT.md),
[conventions](./.agents/docs/CONVENTIONS.md),
[agent workflow](./.agents/docs/AGENT-WORKFLOW.md),
[glossary](./.agents/docs/GLOSSARY.md), and relevant [ADRs](./.agents/docs/adr/).

The [agent workflow](./.agents/docs/AGENT-WORKFLOW.md) is the canonical process for
both coding agents and human contributors. Humans can follow the same Verify and
Finish checklists; the [PR template](./.github/pull_request_template.md) and
`npm run verify` encode a lighter version of those checks.

## Skills

All skills live in [.agents/skills/](./.agents/skills/). Invoke `/ask-glenn` to
find the right skill, then read its `SKILL.md` before following its workflow.

## Workflows

Agent workflows live in [.agents/workflow/](./.agents/workflow/):

- [Grooming.md](./.agents/workflow/Grooming.md) — Issue grooming process
- [Implementing.md](./.agents/workflow/Implementing.md) — Implementation workflow
- [Reviewing.md](./.agents/workflow/Reviewing.md) — PR review process
- [Exploring.md](./.agents/workflow/Exploring.md) — Application/codebase exploration workflow

## Branch names

Create branches only with a gitflow name: `feature/<topic>`, `bugfix/<topic>`,
`hotfix/<topic>`, `release/<version>`, `support/<version-line>`, `develop`, or
`main`. Topics are lowercase kebab-case. Do not invent prefixes such as `cursor/`,
`fix/`, or `templates/`. Full patterns and the four layers of enforcement are in
[.agents/docs/BRANCH-NAMES.md](./.agents/docs/BRANCH-NAMES.md).

## README.md is user-facing and hand-maintained

`README.md` is a hand-maintained project overview (features, setup, development
commands, layout, exports, templates, security). It is not a place for
agent-written process or guidance content.

**Agents must not add new sections, footnotes, or links to `README.md`** unless
the change is a genuine user-facing feature, setup step, or development command.

Agent guidance belongs in `AGENTS.md` or `.agents/docs/`. If a section has already
been added to `README.md` by an agent and it is out of scope, remove it rather
than kept "for completeness".