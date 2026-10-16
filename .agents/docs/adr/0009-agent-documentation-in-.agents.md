# Agent-facing documentation lives in `.agents/`

**Status:** Accepted

Agents and humans contributing to this repository read the same instructions. To
make those instructions easy to find and to keep them separate from user-facing
documentation, everything that is written *for* an agent (or for a human reading
the agent guidance) lives under `.agents/`.

## Decision

Apart from `AGENTS.md` at the repository root, **all agent-facing documentation
MUST be placed inside the `.agents/` folder.** Specifically:

- `.agents/docs/` holds the prose: project context, conventions, the agent
  workflow, the glossary, branch-name rules, the prompts for scheduled agent
  runs, and the ADRs. The agent workflow also records the values this
  repository gives the GitHub workflow skills.
- `.agents/skills/` holds the executable skills (each a `SKILL.md` plus its
  supporting files).

`AGENTS.md` stays at the root because it is the entry point: it is the file
harnesses read first, and it points at the rest.

`docs/` is for user-facing documentation (features, setup, development commands,
layout) and is hand-maintained. It must not be used to store agent instructions.

## Consequences

- Every reference to an agent-facing document is relative to `.agents/`.
- The skill validator's "no repository-specific leakage" check treats a
  reference to `.agents/` as the sanctioned convention rather than a leak.
- Adding agent-facing documentation means adding it under `.agents/`, and adding
  an ADR when the decision is not obvious from the file itself.
- `README.md` is user-facing and hand-maintained: features, setup, development
  commands, layout, exports, templates, security. It is not a place for
  agent-written process or guidance content. Agents must not add new sections,
  footnotes, or links to `README.md` unless the change is a genuine user-facing
  feature, setup step, or development command. Agent guidance that would sit in
  `README.md` belongs in `AGENTS.md` or `.agents/docs/` instead. If a section
  was added to `README.md` by an agent and is out of scope, remove it rather
  than keep it "for completeness".
