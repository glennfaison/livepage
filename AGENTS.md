# Agent guidance

Before changing code, read the [project context](./.agents/docs/CONTEXT.md),
[conventions](./.agents/docs/CONVENTIONS.md),
[agent workflow](./.agents/docs/AGENT-WORKFLOW.md),
[glossary](./.agents/docs/GLOSSARY.md), relevant [ADRs](./.agents/docs/adr/), the
[README](./README.md), and authoritative scripts in [package.json](./package.json).

The [agent workflow](./.agents/docs/AGENT-WORKFLOW.md) is the canonical process for
both coding agents and human contributors. Humans can follow the same Verify and
Finish checklists; the [PR template](./.github/pull_request_template.md) and
`npm run verify` encode a lighter version of those checks.

## Agent skills

### Issue tracker

Issues are tracked in the repo's GitHub Issues (uses the `gh` CLI). See `docs/agents/issue-tracker-github.md`.

### Triage labels

Five canonical triage roles mapped to label strings: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Skills

All skills live in [.agents/skills/](./.agents/skills/). Invoke `/ask-glenn` to
find the right skill, then read its `SKILL.md` before following its workflow.

## Branch names

Create branches only with a gitflow name. GitHub rejects any other name, for agents
and humans alike. Use `feature/<topic>`, `bugfix/<topic>`, `hotfix/<topic>`,
`release/<version>`, `support/<version-line>`, `develop`, or `main`. Topics are
lowercase kebab-case (`feature/gitflow-branch-names`). Do not invent prefixes such
as `cursor/`, `fix/`, or `templates/`. Full patterns and the rejection message are
in [.agents/docs/BRANCH-NAMES.md](./.agents/docs/BRANCH-NAMES.md).

## README.md is user-facing and hand-maintained

`README.md` is a hand-maintained project overview (features, setup, development commands, layout, exports, templates, security). It is not a place for agent-written process or guidance content.

**Agents must not add new sections, footnotes, or links to `README.md`** unless the change is a genuine user-facing feature, setup step, or development command.

When agent guidance is needed, it belongs in `AGENTS.md` or `docs/AGENT-WORKFLOW.md`.

If a section has already been added to `README.md` by an agent and it is out of scope, it should be removed rather than kept "for completeness".
