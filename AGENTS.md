# Agent guidance

This file is the entry point. It points at the rest of the agent-facing
documentation, which lives under [`.agents/`](./.agents/).

## Session start (required)

**Before creating any branch or pull request, read [`.agents/docs/BRANCH-NAMES.md`](./.agents/docs/BRANCH-NAMES.md) in full.** Every agent, bot, and human must use a gitflow name. Do not open a PR until the head branch matches an allowed pattern.

**Before making any commit, read the [evergreen rule](./.agents/docs/AGENT-WORKFLOW.md#Finish): never close an issue labeled `evergreen`.** That label marks an issue that must stay open across releases; raise the conflict to a human instead of closing it.

Run before any commit or push:

```bash
git config core.hooksPath scripts/git-hooks   # branch-name checks at commit and push
```

The hooks validate branch names against that same document.

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

The `glennfaison/github-agent-workflow` skills drive issues and PRs through a
five-step pipeline. Start with `/pipeline-guide`, which lists every skill and
when to use it. Each step has a group skill (picks the work) and an item skill
(does the work on one issue or PR):

1. Exploring: `explore-github-repo` (group), `file-github-issues` (item)
2. Triaging: `triage-github-issues` (group), `triage-github-issue` (item)
3. Implementing: `implement-github-issues` (group), `implement-github-issue` (item)
4. Shepherding: `shepherd-github-prs` (group), `shepherd-github-pr` (item)
5. Reviewing: `review-github-prs` (group), `review-github-pr` (item)

Reviewing has a third outcome besides merging and sending a PR back: a PR that
runs out of review rounds, or that changes a path matched by `human_merge_paths`,
is handed to a person. It gets the `agent:human-merge` label and a comment that
mentions the PR's CODEOWNERS, read from the base branch. Agents never merge it.
The label is created by the label setup in the `agent-workflow-protocol` skill's
`references/labels.md`, so run that setup again after refreshing the skills if
the label is missing.

Utility skills are called by the steps above and are not run on their own, with
one exception: `retrospective` is run by hand. It reads the `agent:log` run-log
issues and reports ranked, evidence-backed suggestions for improving the skills
and the process. It only reads and reports. `/pipeline-guide` lists every
utility skill.

### Settings

These are the key-value inputs the pipeline skills read. Override one per run
with a `key=value` pair on a line of its own; leaving it out keeps the default.

- `pr_base_branch`: develop
- `app_url`: https://livepagecrafter-dev.vercel.app
- `merge_method`: squash
- `human_reviewer`: glennfaison
- `build_cmd`: npm run build
- `git_hooks_path`: scripts/git-hooks
- `repo_guidance`: AGENTS.md
- `trusted_authors`: (none)

## Repository guidance

These files hold this repository's contributor rules: how to scope and verify a
task, the branch-name rules, the PR format, and the code conventions.

- [`.agents/docs/AGENT-WORKFLOW.md`](./.agents/docs/AGENT-WORKFLOW.md) — scope,
  verify, and finish a task
- [`.agents/docs/CONVENTIONS.md`](./.agents/docs/CONVENTIONS.md) — how the code
  should look
- [`.agents/docs/BRANCH-NAMES.md`](./.agents/docs/BRANCH-NAMES.md) — **required reading before any branch or PR**; allowed names and enforcement
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


## Observability

See [`.agents/docs/OBSERVABILITY.md`](./.agents/docs/OBSERVABILITY.md) for what is tracked, privacy choices (canvas content masked), and free-tier limits.
