# Agent workflow

How to scope, verify, and finish a task in this repository. For what the code should look like, see [the conventions](./CONVENTIONS.md). For commands, see the [README](../../README.md#development).

This document is written for coding agents. **Human contributors** can follow the same steps; the [PR template](../../.github/pull_request_template.md) and `npm run verify` (when available) encode the same checks in a lighter form.

## Agent Workflow Files

The GitHub workflows are the [github-agent-workflow](https://github.com/glennfaison/github-agent-workflow) package, installed into `.agents/skills/` with `npx skills` ([ADR 0012](./adr/0012-agent-skills-via-npx-skills.md)). [AGENTS.md](../../AGENTS.md#github-workflow) lists its steps and skills, and `/pipeline-guide` maps them. Prompts for scheduled runs are in [AUTOMATIONS.md](./AUTOMATIONS.md).

### LivePage's settings

The skills have no config file: each default lives in the skill that uses it, and a repository's values are key-value inputs on the scheduler prompt. LivePage's values, all of which differ from a default or matter to a step, are:

```
pr_base_branch=develop
merge_method=squash
human_reviewer=glennfaison
build_cmd=npm run build
git_hooks_path=scripts/git-hooks
repo_guidance=AGENTS.md .agents/docs/AGENT-WORKFLOW.md .agents/docs/CONVENTIONS.md .agents/docs/BRANCH-NAMES.md
```

Add the ones a step uses to its prompt, one per line. Exploring reads `app_url`, which is the deployed LivePage ending in `/try` and is set per prompt in [AUTOMATIONS.md](./AUTOMATIONS.md). Everything a prompt omits keeps the skill's default, listed in the package's [Inputs and defaults](https://github.com/glennfaison/github-agent-workflow#inputs-and-defaults).

## Scope

- **Redesign over minimal diffs.** Do not optimize for the smallest diff. After a change, the code you touched should look as it would if it had been designed strategically from scratch with this requirement in mind. Refactor, rename, extract, and restructure the affected code and its callers whenever that yields a cleaner result than patching around the old shape. This rule takes priority over the two bullets below and over any instinct to keep a change small. Only explicit user requirements (see the last bullet) override it. It does not license unrelated rewrites of code the task has no reason to touch. When you work from an issue's Agent Brief, redesign inside the brief's scope: its **Out of scope** list overrides this rule.
- Prefer to keep focused UI fixes inside the existing feature boundary, but cross it when the redesign rule calls for it. Follow the module-boundary rules in [the conventions](./CONVENTIONS.md) when you do.
- Do not create an ADR or a planning document for a focused task unless the user explicitly asks for one. A new abstraction is welcome when it generalizes existing special cases or deepens a module, as [the conventions](./CONVENTIONS.md) describe.
- Treat explicit layout and DOM-structure requirements as binding. Preserve the existing decorator structure unless a broader redesign is requested. For example, do not replace a requested `display: contents` wrapper with a semantic wrapper or a new overlay architecture, and keep editor controls simple.

## Verify

Work through these in order. Skip items that clearly do not apply to the change.

- [ ] Run the **narrowest relevant Jest selector first** (e.g. `npm test -- --runInBand path/to/test.test.tsx`), then broader checks.
- [ ] Record **known baseline failures** separately. Do not treat unrelated user-modified expectations as regressions.
- [ ] Run `npm run lint` and `npx tsc --noEmit` when the change touches TypeScript or shared types.
- [ ] Restart the **dev server** before browser testing so the browser validates the current application state.
- [ ] For editor controls, decorators, and other positioned UI: check **real geometry after scroll and resize**. Also check client-only and portal rendering for SSR and hydration safety. Passing TypeScript is not enough.
- [ ] When merging a module's exports into a barrel, run the narrowest relevant Jest selector. Eager circular imports can throw at runtime even when `tsc` reports no errors.
- [ ] **UI work is not done until you have seen it in a browser.** For Templates, judge the preview-mode render (`/try?template=<id>&mode=preview`), not the code or edit mode. Follow the [template skills](../skills/template-authoring/SKILL.md).
- [ ] Optionally run `npm run verify` (lint + full Jest suite + branch-name check) as a final local gate before opening the PR.

## Finish

- [ ] Ship every change, Template changes included, in a pull request into `develop`. Do not push straight to `main` or `develop`.
- [ ] Open that pull request from a **gitflow branch**. Allowed names are `feature/<topic>`, `bugfix/<topic>`, `hotfix/<topic>`, `release/<version>`, `support/<version-line>`, `develop`, and `main`. See [branch names](./BRANCH-NAMES.md). A non-matching push is rejected by GitHub and fails CI.
- [ ] Check whether the change introduces or renames entities, relationships, or domain terms. If it does, update [the glossary](./GLOSSARY.md) before finishing.

## Orchestration

- For anything beyond a focused fix, follow the [agent orchestration skill](../skills/agent-orchestration/SKILL.md): a design sub-agent, then coder sub-agents, then reviewer sub-agents, passing work along with the `/handoff` skill and iterating until the goal is met.
- Whenever you write non-trivial code, have a fresh review sub-agent review it (trivial edits such as typos and one-line fixes only need your own check). The reviewer fixes the issues it finds rather than only reporting them, so the main agent's context stays small. It must not edit tests or allowlists to get green; you read its diff before accepting.
- End the task by suggesting which parts of the process could be automated deterministically to reduce token use. In an unattended workflow run, nobody is there to read it: put the suggestions in the run log instead, as [log.md](../skills/agent-workflow-protocol/references/log.md) describes.

## Sub-agents

- For parallel agents or sub-agents, use the lowest-cost model that still meets the task's quality and context requirements. Upgrade only if needed.

## Unattended runs

Scheduled runs ([AUTOMATIONS.md](./AUTOMATIONS.md)) follow the `agent-workflow-protocol` skill first. This page applies on top of it, except where it tells you to ask a person or wait for one.

- Nobody answers questions. Where a rule here would have you ask, use the skill's own route: `needs-info`, `ready-for-human`, or escalation (`agent:stuck`).
- `/handoff` is user-invoked, so a sub-agent cannot call it. Hand work to a sub-agent in a plain message that links the issue, branch, and files, and ask for its reply in the same form.
- If you cannot run a check, such as the browser, the dev server, or the full suite, say so under **Verification** in the PR handoff and name the risk for the reviewer. Never report a check you did not run.
- Put automation suggestions in the run log, as the Orchestration section says. Do not implement them.
