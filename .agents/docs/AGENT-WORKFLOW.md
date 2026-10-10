# Agent workflow

How to scope, verify, and finish a task in this repository. For what the code should look like, see [the conventions](./CONVENTIONS.md). For commands, see the [README](../../README.md#development).

This document is written for coding agents. **Human contributors** can follow the same steps; the [PR template](../../.github/pull_request_template.md) and `npm run verify` (when available) encode the same checks in a lighter form.

## Agent Workflow Files

The GitHub workflows are skills under [.agents/skills/](../../.agents/skills/). Each
step has a group skill that selects work and an item skill that does the work on
one issue or PR. Shared material (labels, protocol, dedupe, handoff, log, etc.) is in
[github-workflow-protocol](../../.agents/skills/github-workflow-protocol/SKILL.md).

**Shared:**

- [github-workflow-protocol](../../.agents/skills/github-workflow-protocol/SKILL.md) — Claim/lease rules and helpers
- [labels.md](../../.agents/skills/github-workflow-protocol/references/labels.md) — Labels and state transitions (read this first)

**Skills** (group → item):

- [explore-github-repo](../../.agents/skills/explore-github-repo/SKILL.md) → [file-github-issue](../../.agents/skills/file-github-issue/SKILL.md) — Explore app/codebase; file unlabeled issues
- [triage-github-issues](../../.agents/skills/triage-github-issues/SKILL.md) → [triage-github-issue](../../.agents/skills/triage-github-issue/SKILL.md) — Triage and mark issues ready-for-agent or ready-for-human
- [implement-github-issues](../../.agents/skills/implement-github-issues/SKILL.md) → [implement-github-issue](../../.agents/skills/implement-github-issue/SKILL.md) — Implement a ready-for-agent issue and open a PR
- [shepherd-github-prs](../../.agents/skills/shepherd-github-prs/SKILL.md) → [shepherd-github-pr](../../.agents/skills/shepherd-github-pr/SKILL.md) — Get a PR through checks and post the review handoff
- [review-github-prs](../../.agents/skills/review-github-prs/SKILL.md) → [review-github-pr](../../.agents/skills/review-github-pr/SKILL.md) — Review a ready PR and merge when safe

## Scope

- **Redesign over minimal diffs.** Do not optimize for the smallest diff. After a change, the code you touched should look as it would if it had been designed strategically from scratch with this requirement in mind. Refactor, rename, extract, and restructure the affected code and its callers whenever that yields a cleaner result than patching around the old shape. This rule takes priority over the two bullets below and over any instinct to keep a change small. Only explicit user requirements (see the last bullet) override it. It does not license unrelated rewrites of code the task has no reason to touch.
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

- [ ] Ship Template changes in a pull request, never straight to `main`.
- [ ] Open that pull request from a **gitflow branch**. Allowed names are `feature/<topic>`, `bugfix/<topic>`, `hotfix/<topic>`, `release/<version>`, `support/<version-line>`, `develop`, and `main`. See [branch names](./BRANCH-NAMES.md). A non-matching push is rejected by GitHub and fails CI.
- [ ] Check whether the change introduces or renames entities, relationships, or domain terms. If it does, update [the glossary](./GLOSSARY.md) before finishing.

## Orchestration

- For anything beyond a focused fix, follow the [agent orchestration skill](../skills/agent-orchestration/SKILL.md): a design sub-agent, then coder sub-agents, then reviewer sub-agents, passing work along with the `/handoff` skill and iterating until the goal is met.
- Whenever you write non-trivial code, have a fresh review sub-agent review it (trivial edits such as typos and one-line fixes only need your own check). The reviewer fixes the issues it finds rather than only reporting them, so the main agent's context stays small. It must not edit tests or allowlists to get green; you read its diff before accepting.
- End the task by suggesting which parts of the process could be automated deterministically to reduce token use. In an unattended workflow run, nobody is there to read it: put the suggestions in the run log instead, as [log.md](../skills/github-workflow-protocol/references/log.md) describes.

## Sub-agents

- For parallel agents or sub-agents, use the lowest-cost model that still meets the task's quality and context requirements. Upgrade only if needed.
