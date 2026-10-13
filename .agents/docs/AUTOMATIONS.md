# Scheduled agent runs

Prompts for running the [github-agent-workflow](../skills/github-agent-workflow/README.md) steps from a scheduler. The runner decides when a run starts; the skills decide what it does. The package's `docs/RUNNERS.md` (in its repository) explains what a runner needs and why. This page holds LivePage's values.

| Value | LivePage |
| --- | --- |
| Repository | `glennfaison/livepage` |
| PR base branch | `develop`, passed as `pr_base_branch=develop` (see [the live settings](./AGENT-WORKFLOW.md#livepages-settings)) |
| Skills repository | `glennfaison/github-agent-workflow` |
| Pinned skills commit (`REF`) | `34fd92cc0a2d939c2d284f4eb340362d7bb6e868`, the commit the submodule points at. Check with `git ls-tree HEAD .agents/skills/github-agent-workflow` |
| App to explore (`app_url`) | The URL of the deployed LivePage, ending in `/try` |

The skills read no config file. Everything a prompt below leaves out keeps the skill's own default, listed in the package's [Inputs and defaults](../skills/github-agent-workflow/README.md#inputs-and-defaults); only LivePage's differing values are set here.

Update `REF` in the Grok prompts whenever the submodule pointer moves ([ADR 0011](./adr/0011-agent-skills-as-submodules.md)).

## Which runner for which step

| Step | Kilo Code Cloud Agent | Grok with a GitHub connector (no shell) | Grok Build (shell) |
| --- | --- | --- | --- |
| Exploring | Yes | Yes, if it can browse the app | Yes |
| Grooming | Yes | Yes | Yes |
| Implementing | Yes | No: it cannot run tests or the build | Yes |
| Shepherding | Yes | No: it cannot read check logs | Yes |
| Reviewing | Yes | Only if the connector can merge pinned to a commit | Yes |

Run Implementing, Shepherding and Reviewing on a runner with a shell. A runner without one bails out of them by design.

## Kilo Code (Cloud Agent scheduled triggers)

One scheduled trigger per step, each with the repository `glennfaison/livepage`.

**Agent environment profile**

- Secret `GH_TOKEN`: a token that can write Contents, Issues and Pull requests, and read Actions.
- Setup commands, in order. Check that the image has `gh` and `jq`, and install them here if it does not:

  ```bash
  git submodule update --init --recursive
  git config user.name "livepage-agent"
  git config user.email "livepage-agent@users.noreply.github.com"
  git config core.hooksPath scripts/git-hooks
  npm ci
  ```

**Prompts**

Exploring:

```text
Run /explore-github-repo on github.com/glennfaison/livepage. app_url=https://APP_URL.
No human is present: do not ask questions. Runner: kilo.
If /explore-github-repo is not recognised, call the Skill tool with explore-github-repo, or read .agents/skills/explore-github-repo/SKILL.md and follow it.
```

Grooming:

```text
Run /triage-github-issues on github.com/glennfaison/livepage.
No human is present: do not ask questions. Runner: kilo.
If /triage-github-issues is not recognised, call the Skill tool with triage-github-issues, or read .agents/skills/triage-github-issues/SKILL.md and follow it.
```

Implementing (LivePage sets a build step, a hooks path and its guidance files, not just the branch):

```text
Run /implement-github-issues on github.com/glennfaison/livepage.
pr_base_branch=develop
build_cmd=npm run build
git_hooks_path=scripts/git-hooks
repo_guidance=AGENTS.md .agents/docs/AGENT-WORKFLOW.md .agents/docs/CONVENTIONS.md .agents/docs/BRANCH-NAMES.md
No human is present: do not ask questions. Runner: kilo.
If /implement-github-issues is not recognised, call the Skill tool with implement-github-issues, or read .agents/skills/implement-github-issues/SKILL.md and follow it.
```

Shepherding:

```text
Run /shepherd-github-prs on github.com/glennfaison/livepage.
No human is present: do not ask questions. Runner: kilo.
If /shepherd-github-prs is not recognised, call the Skill tool with shepherd-github-prs, or read .agents/skills/shepherd-github-prs/SKILL.md and follow it.
```

Reviewing:

```text
Run /review-github-prs on github.com/glennfaison/livepage. merge_method=squash
No human is present: do not ask questions. Runner: kilo.
If /review-github-prs is not recognised, call the Skill tool with review-github-prs, or read .agents/skills/review-github-prs/SKILL.md and follow it.
```

## Grok

### With a shell (Grok Build)

Use the Kilo prompts above with `Runner: grok`. Run them from a checkout where `git submodule update --init --recursive` and `git config core.hooksPath scripts/git-hooks` have been run, with `GH_TOKEN` exported.

### With a GitHub connector and no shell (automations)

A connector reading `glennfaison/livepage` sees only a pointer to the skills, not the skills. These prompts read them from the skills repository instead. Replace `REF` with the pinned commit, and `SKILL` with one of `explore-github-repo`, `triage-github-issues`, `implement-github-issues`, `shepherd-github-prs`, `review-github-prs`:

```text
You are running unattended: no human will answer questions. Runner: grok.
Repository: glennfaison/livepage. Skills repository: glennfaison/github-agent-workflow at REF.
Read skills/pipeline/SKILL/SKILL.md from the skills repository and follow it.
Where a skill says "Call the Skill tool with X", read skills/BUCKET/X/SKILL.md from the skills repository and follow it. BUCKET is meta for agent-workflow-protocol, pipeline-guide and setup-github-agent-workflow; utility for merge-safety, unattended-triage and grill-via-github-comments; and pipeline for every other skill.
You have no shell: follow "Running without a shell" in skills/meta/agent-workflow-protocol/SKILL.md.
LivePage's settings are key-value inputs in the prompt above; the full list is in .agents/docs/AGENT-WORKFLOW.md, and the repository's rules are in AGENTS.md, both in the repository.
```

For Exploring, add a last line: `app_url=https://APP_URL.`

To read the code, the connector needs to see `.agents/docs/` and the source, which are ordinary files in `glennfaison/livepage`.

## Cadence

Offset the minutes so runs do not start together.

| Step | Every | Why |
| --- | --- | --- |
| Exploring | Week | Files at most 5 issues per run |
| Grooming | 2 hours | Takes at most 5 issues per run |
| Implementing | 3 hours | One issue per run; the lease lasts 3 hours |
| Shepherding | 1 hour | Skips PRs whose checks are still running |
| Reviewing | 1 hour | Merges into `develop` |

## Before you schedule anything

1. Run `/setup-github-agent-workflow` once, by hand.
2. Run each step by hand. Read the comment it leaves on the monthly `Agent log` issue, under **Problems**.
3. Schedule Exploring and Grooming first, then Implementing and Shepherding, and Reviewing last.

To stop one item, label it `agent:stuck`. To stop a step, pause its automation.
