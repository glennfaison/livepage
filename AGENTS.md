# Agent guidance

Before changing code, read the [project context](./.agents/docs/CONTEXT.md),
[conventions](./.agents/docs/CONVENTIONS.md),
[agent workflow](./.agents/docs/AGENT-WORKFLOW.md),
[glossary](./.agents/docs/GLOSSARY.md), and relevant [ADRs](./.agents/docs/adr/).
<<<<<<< HEAD

Treat every task, including agent-documentation changes, as a fresh start unless
the user explicitly requests backward compatibility. For changes involving
migrations or compatibility, follow [ADR 0010](./.agents/docs/adr/0010-fresh-start-no-compatibility.md).

The [agent workflow](./.agents/docs/AGENT-WORKFLOW.md) is the canonical process for
both coding agents and human contributors. Humans can follow the same Verify and
Finish checklists; the [PR template](./.github/pull_request_template.md) and
`npm run verify` encode a lighter version of those checks.

## Session start (required)

Run before any commit or push:

```bash
git config core.hooksPath scripts/git-hooks   # branch-name checks at commit and push
```

The hooks validate branch names against [.agents/docs/BRANCH-NAMES.md](./.agents/docs/BRANCH-NAMES.md).

## Skills

All skills live in [.agents/skills/](./.agents/skills/). Invoke `/ask-glenn` to find the right skill, then read its `SKILL.md` before following its workflow. Skills from other repositories are installed with the skills CLI and committed in `.agents/skills/`, with `skills-lock.json` ([ADR 0012](./.agents/docs/adr/0012-agent-skills-via-npx-skills.md)). Nothing needs installing at session start.

To install or refresh them, run the commands below and commit the changed folders and `skills-lock.json`. Do not edit installed skills here; fix them in their source repository. Do not commit `.grok/`.

```bash
npx skills@latest add glennfaison/github-agent-workflow --skill '*' -y --copy
npx skills@latest add fallow-rs/fallow-skills --skill '*' -y --copy
npx skills@latest add mattpocock/skills --skill ask-matt --skill code-review --skill codebase-design --skill diagnosing-bugs --skill domain-modeling --skill grill-with-docs --skill implement --skill implement-spec --skill improve-codebase-architecture --skill pr --skill prototype --skill research --skill retro --skill setup-matt-pocock-skills --skill tdd --skill to-spec --skill to-tickets --skill triage --skill wayfinder --skill wizard -y --copy
```

Two review skills exist. `/code-review` (Matt Pocock's) is the general standards-and-spec review. [`/livepage-code-review`](./.agents/skills/livepage-code-review/SKILL.md) is this repository's own, for LivePage architecture and convention checks.

## GitHub workflow

The issue-to-merge pipeline is the [github-agent-workflow](https://github.com/glennfaison/github-agent-workflow) package, installed into `.agents/skills/`. `/pipeline-guide` is the map. Each step has a **group skill** that selects work and an **item skill** that does the work on one issue or PR, so both can be run directly: `/triage-github-issues` for the backlog, `/triage-github-issue 123` for one issue.

| Step | Group skill | Item skill |
| --- | --- | --- |
| Explore the app and codebase; file unlabelled issues | `/explore-github-repo` | `/file-github-issues` |
| Triage; mark issues ready-for-agent or ready-for-human | `/triage-github-issues` | `/triage-github-issue` |
| Implement a ready-for-agent issue and open a PR | `/implement-github-issues` | `/implement-github-issue` |
| Get a PR through checks and post the review handoff | `/shepherd-github-prs` | `/shepherd-github-pr` |
| Review a ready PR and merge when safe | `/review-github-prs` | `/review-github-pr` |

Read `/agent-workflow-protocol` first: it holds the lease rules, the helpers, the unattended and no-shell rules, and (in `references/labels.md`) every label and state transition. `/merge-safety` gates merging. `/code-review` and `/livepage-code-review` are used before opening a PR and when reviewing one. `/tdd` comes from [mattpocock/skills](https://github.com/mattpocock/skills).

- Run `/setup-github-agent-workflow` once to create the labels and record LivePage's values. The values are in [the live settings block](./.agents/docs/AGENT-WORKFLOW.md#livepages-settings), passed to each run as key-value inputs.
- Scheduled runs (Kilo Code, Grok) use the prompts in [.agents/docs/AUTOMATIONS.md](./.agents/docs/AUTOMATIONS.md). Nobody answers questions in them: follow the protocol's unattended rules and the [unattended section of the agent workflow](./.agents/docs/AGENT-WORKFLOW.md#unattended-runs).

## Workflows

Agent workflows live in [.agents/workflow/](./.agents/workflow/). Each step file
documents its **Inputs** (what it selects and claims) and **Outputs** (labels,
comments, and artifacts it produces). Shared material is in
[.agents/workflow/_shared/](./.agents/workflow/_shared/).

**Shared (read first for labels and protocol):**

- [Labels.md](./.agents/workflow/_shared/Labels.md) — Every label the workflows use, and the state transitions between them
- [Protocol.md](./.agents/workflow/_shared/Protocol.md) — Claim/lease rules, helpers, and interactive-skill overrides

**Steps** (independent; may run in any order or in parallel):

- [Exploring.md](./.agents/workflow/Exploring.md) — Explore app/codebase; file unlabeled issues
- [Grooming.md](./.agents/workflow/Grooming.md) — Triage and mark issues ready-for-agent or ready-for-human
- [Implementing.md](./.agents/workflow/Implementing.md) — Implement a ready-for-agent issue and open a PR
- [Shepherding.md](./.agents/workflow/Shepherding.md) — Get a PR through checks and post the review handoff
- [Reviewing.md](./.agents/workflow/Reviewing.md) — Review a ready PR and merge when safe

## Branch names

Create branches only with a gitflow name: `feature/<topic>`, `bugfix/<topic>`,
`hotfix/<topic>`, `release/<version>`, `support/<version-line>`, `develop`, or
`main`. Topics are lowercase kebab-case. Do not invent prefixes such as `cursor/`,
`fix/`, or `templates/`. Open pull requests against `develop`; `main` only
accepts PRs from `develop`. Full patterns and the four layers of enforcement are
in [.agents/docs/BRANCH-NAMES.md](./.agents/docs/BRANCH-NAMES.md).## Git hooks (required)

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
>>>>>>> main

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
