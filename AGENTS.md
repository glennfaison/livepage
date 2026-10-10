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

The GitHub workflows are skills in [.agents/skills/](./.agents/skills/). Each step
has a **group skill** that selects work and an **item skill** that does the work
on one issue or PR. Group skills dispatch to item skills, so both can be run
directly: `/triage-github-issues` for the backlog, `/triage-github-issue 123` for one issue.

**Shared (read first for labels and protocol):**

- [github-workflow-protocol](./.agents/skills/github-workflow-protocol/SKILL.md) — Claim/lease rules, helpers, unattended and no-shell rules, interactive-skill overrides
- [labels.md](./.agents/skills/github-workflow-protocol/references/labels.md) — Every label the workflows use, and the state transitions between them

**Steps** (independent; may run in any order or in parallel):

| Step | Group skill | Item skill |
| --- | --- | --- |
| Explore the app and codebase; file unlabelled issues | [explore-github-repo](./.agents/skills/explore-github-repo/SKILL.md) | [file-github-issue](./.agents/skills/file-github-issue/SKILL.md) |
| Triage; mark issues ready-for-agent or ready-for-human | [triage-github-issues](./.agents/skills/triage-github-issues/SKILL.md) | [triage-github-issue](./.agents/skills/triage-github-issue/SKILL.md) |
| Implement a ready-for-agent issue and open a PR | [implement-github-issues](./.agents/skills/implement-github-issues/SKILL.md) | [implement-github-issue](./.agents/skills/implement-github-issue/SKILL.md) |
| Get a PR through checks and post the review handoff | [shepherd-github-prs](./.agents/skills/shepherd-github-prs/SKILL.md) | [shepherd-github-pr](./.agents/skills/shepherd-github-pr/SKILL.md) |
| Review a ready PR and merge when safe | [review-github-prs](./.agents/skills/review-github-prs/SKILL.md) | [review-github-pr](./.agents/skills/review-github-pr/SKILL.md) |

## Branch names

Create branches only with a gitflow name: `feature/<topic>`, `bugfix/<topic>`,
`hotfix/<topic>`, `release/<version>`, `support/<version-line>`, `develop`, or
`main`. Topics are lowercase kebab-case. Do not invent prefixes such as `cursor/`,
`fix/`, or `templates/`. Full patterns and the four layers of enforcement are in
[.agents/docs/BRANCH-NAMES.md](./.agents/docs/BRANCH-NAMES.md).

## Git hooks (required)

Local git hooks enforce branch-name compliance at commit and push time.
Enable them at **session start**:

```bash
git config core.hooksPath scripts/git-hooks
```

This must be run before any commits or pushes. The hooks validate branch names against the gitflow patterns in [.agents/docs/BRANCH-NAMES.md](./.agents/docs/BRANCH-NAMES.md).

## PR descriptions and closing issues

When opening a PR that resolves multiple issues, use separate `Closes` statements for each issue. GitHub only auto-links the first issue in a single sentence.

**Correct:**
```
- Closes #122. 
- Closes #123. 
- Closes #124. 
- Closes #125.
```

**Correct:**
```
- Related to #122. 
- Related to #123. 
- Related to #124. 
- Related to #125.
```

**Incorrect (only closes #122):**
```
Closes #122, #123, #124, #125
```

## README.md is user-facing and hand-maintained

`README.md` is a hand-maintained project overview (features, setup, development
commands, layout, exports, templates, security). It is not a place for
agent-written process or guidance content.

**Agents must not add new sections, footnotes, or links to `README.md`** unless
the change is a genuine user-facing feature, setup step, or development command.

Agent guidance belongs in `AGENTS.md` or `.agents/docs/`. If a section has already
been added to `README.md` by an agent and it is out of scope, remove it rather
than kept "for completeness".
