---
name: agent-orchestration
description: Orchestrate a non-trivial task through design, coding and review sub-agents with handoffs between them, iterating until the goal is met, then suggest deterministic automations. Use when given a problem that needs more than a focused fix, or when asked to plan and build a feature.
---

# Agent orchestration

The main agent coordinates. It keeps its own context small by delegating each phase to a fresh sub-agent and passing work along with the [handoff skill](../handoff/SKILL.md).

Skip the design phase for focused fixes (a single obvious change). Never skip review.

## Loop

1. **Design.** Spawn a system-design sub-agent with the problem, constraints and links to [CONTEXT](../../../docs/CONTEXT.md), [CONVENTIONS](../../../docs/CONVENTIONS.md) and relevant ADRs. It explores the code and decides the approach: boundaries, data flow, new abstractions, risks, test plan. It writes no code. It ends by calling `handoff`.
2. **Hand off to the main agent.** Read the design handoff, resolve open questions (ask the user only for real product decisions), and split the work into independent slices.
3. **Code.** Hand each slice to a coder sub-agent via `handoff`. Coders implement, add tests, and run the narrowest relevant checks. Independent slices run in parallel on separate branches or worktrees.
4. **Review.** For every coder result, spawn a fresh reviewer sub-agent (see [code-review](../code-review/SKILL.md) for the checklist). The reviewer **applies fixes for the issues it finds** instead of only reporting them, re-runs the checks, and returns a short verdict listing what it changed. It does not commit or open a PR. Domain reviewers, such as [template-design-review](../template-design-review/SKILL.md), replace the generic checklist where they exist.
5. **Iterate.** If the verdict shows an unmet goal or a design flaw, return to the earliest phase that is wrong (design for structural problems, code for implementation gaps) with a new handoff. Stop when the goal is met and checks pass, or after three full iterations, then report what remains.
6. **Ship.** Follow [AGENT-WORKFLOW](../../../docs/AGENT-WORKFLOW.md) for validation and the pull request.

## Rules

- Use the lowest-cost model that meets each phase's needs.
- Handoffs reference artifacts (files, diffs, issues) rather than copying them.
- Sub-agents get a bounded objective and a stop condition.

## Finish: automation suggestions

End every orchestrated task with a short section, "Automation suggestions". List steps in this run that were repetitive and deterministic and cost tokens, for example repeated lint/test loops, scaffolding, browser checks, or log reading. For each, propose how to automate it (script, test, hook, skill, or CI check). Use `/chronicle tips` to ground suggestions in real usage when available. Only suggest; do not implement unless asked.
