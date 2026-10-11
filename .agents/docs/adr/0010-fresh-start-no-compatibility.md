# Agents work fresh, without compatibility or migration

**Status:** Accepted

Agents tend to preserve old shapes: a renamed path keeps an alias, a changed
format keeps a reader for the old one, a move ships with a migration checklist.
Each addition is code or prose that every later reader must understand.

## Decision

Unless the user explicitly requests backward compatibility, agents treat every
task, including agent documentation, as if starting the project today. They
design the code and the docs for the intended end state and do **not** add:

- migrations or migration checklists,
- compatibility shims, aliases, or re-exports for old names and paths,
- dual-format reading or writing,
- deprecation periods or transition plans,

just to preserve legacy behavior. A user's explicit request for backward
compatibility is the opt-in; when given, agents follow it and say what they
preserved.

This does not mean deleting unrelated current behavior. Agents change what the
task touches and leave the rest alone. Reviews, including `merge-safety`, do not
require a migration plan by default; they check explicitly requested
compatibility.

## Consequences

- The GitHub workflow config lives at `.agents/docs/github-agent-workflow.env`
  (see [ADR 0009](./0009-agent-documentation-in-.agents.md)), with no redirect
  from any other location.
- Agent docs describe the current state only, with no "previously" or "moved
  from" notes.
