# Agent guidance

This file is the entry point. It points at the rest of the agent-facing
documentation, which lives under [`.agents/`](./.agents/).

## Session start (required)

Run before any commit or push:

```bash
git config core.hooksPath scripts/git-hooks   # branch-name checks at commit and push
```

The hooks validate branch names against [`.agents/docs/BRANCH-NAMES.md`](./.agents/docs/BRANCH-NAMES.md).

## Skills

All skills live in [`.agents/skills/`](./.agents/skills/). Skills from other
repositories are installed with the skills CLI and committed in
`.agents/skills/`, with `skills-lock.json`
([ADR 0012](./.agents/docs/adr/0012-agent-skills-via-npx-skills.md)). Nothing
needs installing at session start.

Some skills here are this repository's own, not installed: they live in
`.agents/skills/` as tracked files and are never overwritten by a skill refresh
(the refresh only touches the folders it installs, and `skills-lock.json`
records which those are). `ask-glenn`, `livepage-code-review` and the template
skills are examples. A change to one of those is a change to this repository.

To install or refresh them, run the commands below and commit the changed
folders and `skills-lock.json`. We simply NEVER edit installed skills: a change
to one goes in its source repository, and a refresh re-installs it here. Do not
commit `.grok/`.

```bash
npx skills@latest add glennfaison/github-agent-workflow --skill '*' -y --copy
npx skills@latest add fallow-rs/fallow-skills --skill '*' -y --copy
npx skills@latest add mattpocock/skills --skill ask-matt --skill code-review --skill codebase-design --skill diagnosing-bugs --skill domain-modeling --skill grill-with-docs --skill implement --skill implement-spec --skill improve-codebase-architecture --skill pr --skill prototype --skill research --skill retro --skill setup-matt-pocock-skills --skill tdd --skill to-spec --skill to-tickets --skill triage --skill wayfinder --skill wizard -y --copy
```

## GitHub workflow

The issue-to-merge pipeline is the [github-agent-workflow](https://github.com/glennfaison/github-agent-workflow) package, installed into `.agents/skills/`. `/pipeline-guide` is the map. Each step has a **group skill** that selects work and an **item skill** that does the work on one issue or PR:

| Step | Group skill | Item skill |
| --- | --- | --- |
| Explore the app and codebase; file unlabelled issues | `/explore-github-repo` | `/file-github-issues` |
| Triage; mark issues ready-for-agent or ready-for-human | `/triage-github-issues` | `/triage-github-issue` |
| Implement a ready-for-agent issue and open a PR | `/implement-github-issues` | `/implement-github-issue` |
| Get a PR through checks and post the review handoff | `/shepherd-github-prs` | `/shepherd-github-pr` |
| Review a ready PR and merge when safe | `/review-github-prs` | `/review-github-pr` |

Two review skills exist. `/code-review` (Matt Pocock's) is the general standards-and-spec review. `/livepage-code-review` is this repository's own, for LivePage architecture and convention checks.

## Repository guidance

These files hold this repository's contributor rules: how to scope and verify a
task, the branch-name rules, the PR format, and the code conventions.

- [`.agents/docs/AGENT-WORKFLOW.md`](./.agents/docs/AGENT-WORKFLOW.md) — scope,
  verify, and finish a task
- [`.agents/docs/CONVENTIONS.md`](./.agents/docs/CONVENTIONS.md) — how the code
  should look
- [`.agents/docs/BRANCH-NAMES.md`](./.agents/docs/BRANCH-NAMES.md) — allowed
  branch names and how they are enforced
- [`.agents/docs/PR-FORMAT.md`](./.agents/docs/PR-FORMAT.md) — how to close
  issues and target a branch in a PR body

## README.md is user-facing and hand-maintained

`README.md` is a hand-maintained project overview (features, setup, development
commands, layout, exports, templates, security). It is not a place for
agent-written process or guidance content.

**Agents must not add new sections, footnotes, or links to `README.md`** unless
the change is a genuine user-facing feature, setup step, or development command.

Agent guidance belongs in `AGENTS.md` or `.agents/docs/`. If a section has already
been added to `README.md` by an agent and is out of scope, remove it rather than
kept "for completeness".
