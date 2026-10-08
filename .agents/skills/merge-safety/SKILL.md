---
name: merge-safety
description: Assess whether a pull request is safe for an agent to merge by checking breaking changes, rollback blast radius, and merge readiness. Use when deciding whether a PR is safe to merge.
---

# Merge safety

Give an evidence-based assessment against the repository's
[PR merge policy](../../docs/AGENT-WORKFLOW.md#pr-review-and-merge-authority).
This skill does not perform the merge; agents must merge when the assessment
confirms every safe-PR condition.

## Workflow

1. Establish the exact PR, base and head, then inspect the complete diff and
   relevant callers or contracts. Read the linked issue when it clarifies the
   intended behavior.
2. Verify that every unskipped check on the PR has passed and its deployment
   succeeded. Treat the PR description as a claim, not proof of either result.
3. Inspect the diff and relevant tests. If behavior changes, verify that written
   Playwright or Jest tests cover those changes.
4. Compare the change with existing ADRs and verify that it does not infringe on
   any of them.
5. Report **PASS** only when all four safe-PR conditions in the repository
   policy are verified. Use **BLOCK** when a condition fails and **HOLD** when
   evidence is missing or a check or deployment is pending. Do not turn
   uncertainty into a pass. When the verdict is **PASS**, the agent must merge
   the PR without bypassing branch protection.

## Report

```text
Verdict: PASS | BLOCK | HOLD
Checks and deployment: <status and evidence>
Behavior tests: None needed | Playwright/Jest coverage and evidence | Missing
ADR compliance: Clear | <conflict and evidence>
Blockers or next steps: <specific actions, or None>
```

Link findings to exact files and lines or to the relevant GitHub status.
