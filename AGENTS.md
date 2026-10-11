# Agent guidance

Before changing code, read the [project context](./.agents/docs/CONTEXT.md),
[conventions](./.agents/docs/CONVENTIONS.md),
[agent workflow](./.agents/docs/AGENT-WORKFLOW.md),
[glossary](./.agents/docs/GLOSSARY.md), and relevant [ADRs](./.agents/docs/adr/).

Treat every task, including agent-documentation changes, as a fresh start unless
the user explicitly requests backward compatibility. For changes involving
migrations or compatibility, follow [ADR 0010](./.agents/docs/adr/0010-fresh-start-no-compatibility.md).

The [agent workflow](./.agents/docs/AGENT-WORKFLOW.md) is the canonical process for
both coding agents and human contributors. Humans can follow the same Verify and
Finish checklists; the [PR template](./.github/pull_request_template.md) and
`npm run verify` encode a lighter version of those checks.

## Session start (required)

Run both before any commit or push:

```bash
git submodule update --init --recursive   # skills live in submodules; without this, .agents/skills/ has dangling links
git config core.hooksPath scripts/git-hooks   # branch-name checks at commit and push
```

The hooks validate branch names against [.agents/docs/BRANCH-NAMES.md](./.agents/docs/BRANCH-NAMES.md).

## Skills

All skills live in [.agents/skills/](./.agents/skills/). Invoke `/ask-glenn` to find the right skill, then read its `SKILL.md` before following its workflow. Some entries there are symlinks into submodules ([ADR 0011](./.agents/docs/adr/0011-agent-skills-as-submodules.md)): refer to a skill by its name, never by a path inside a submodule.

## GitHub workflow

The issue-to-merge pipeline is the [github-agent-workflow](./.agents/skills/github-agent-workflow/README.md) package, a pinned git submodule. `/pipeline-guide` is the map. Each step has a **group skill** that selects work and an **item skill** that does the work on one issue or PR, so both can be run directly: `/triage-github-issues` for the backlog, `/triage-github-issue 123` for one issue.

| Step | Group skill | Item skill |
| --- | --- | --- |
| Explore the app and codebase; file unlabelled issues | `/explore-github-repo` | `/file-github-issue` |
| Triage; mark issues ready-for-agent or ready-for-human | `/triage-github-issues` | `/triage-github-issue` |
| Implement a ready-for-agent issue and open a PR | `/implement-github-issues` | `/implement-github-issue` |
| Get a PR through checks and post the review handoff | `/shepherd-github-prs` | `/shepherd-github-pr` |
| Review a ready PR and merge when safe | `/review-github-prs` | `/review-github-pr` |

Read `/agent-workflow-protocol` first: it holds the lease rules, the helpers, the unattended and no-shell rules, and (in `references/labels.md`) every label and state transition. `/merge-safety` gates merging. [code-review](./.agents/skills/code-review/SKILL.md) is this repository's own skill and is used before opening a PR and when reviewing one. `/tdd` comes from [mattpocock/skills](./.agents/skills/matt-pocock-skills/README.md).

- Run `/setup-github-agent-workflow` once to create the labels and settings. LivePage's settings are in [.agents/docs/github-agent-workflow.env](./.agents/docs/github-agent-workflow.env).
- Scheduled runs (Kilo Code, Grok) use the prompts in [.agents/docs/AUTOMATIONS.md](./.agents/docs/AUTOMATIONS.md). Nobody answers questions in them: follow the protocol's unattended rules and the [unattended section of the agent workflow](./.agents/docs/AGENT-WORKFLOW.md#unattended-runs).

## Branch names

Create branches only with a gitflow name: `feature/<topic>`, `bugfix/<topic>`,
`hotfix/<topic>`, `release/<version>`, `support/<version-line>`, `develop`, or
`main`. Topics are lowercase kebab-case. Do not invent prefixes such as `cursor/`,
`fix/`, or `templates/`. Open pull requests against `develop`; `main` only
accepts PRs from `develop`. Full patterns and the four layers of enforcement are
in [.agents/docs/BRANCH-NAMES.md](./.agents/docs/BRANCH-NAMES.md).

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
