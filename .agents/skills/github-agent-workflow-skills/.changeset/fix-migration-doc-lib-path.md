---
"github-agent-workflow-skills": patch
---

Move agent-facing docs from `docs/agents/` into `.agents/docs/agents/` per the
new convention (ADR 0009). Update the GitHub workflow skills' config contract
and all references to point at `.agents/docs/agents/github-workflow.env` instead
of the old `docs/agents/github-workflow.env` path.