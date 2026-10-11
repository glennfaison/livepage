# Agent-facing documentation lives in `.agents/`

**Status:** Superseded by [ADR 0010](./0010-fresh-start-no-compatibility.md) in part: the `.agents/docs/agents/` location is replaced by `.agents/docs/github-workflow.env`, and the migration notes below are historical. The rest of the decision stands.

Agents and humans contributing to this repository read the same instructions. To
make those instructions easy to find and to keep them separate from user-facing
documentation, everything that is written *for* an agent (or for a human reading
the agent guidance) lives under `.agents/`.

## Decision

Apart from `AGENTS.md` at the repository root, **all agent-facing documentation
MUST be placed inside the `.agents/` folder.** Specifically:

- `.agents/docs/` holds the prose: project context, conventions, the agent
  workflow, the glossary, branch-name rules, and the ADRs.
- `.agents/skills/` holds the executable skills (each a `SKILL.md` plus its
  supporting files).
- Agent-facing configuration that a repository customizes — for example the
  GitHub workflow overrides — goes in `.agents/docs/agents/`, alongside the ADRs
  and not in `docs/`.

`AGENTS.md` stays at the root because it is the entry point: it is the file
harnesses read first, and it points at the rest.

## What moved

The repository previously kept agent-facing material in `docs/agents/`. That
material is now in `.agents/docs/agents/`:

- `docs/agents/github-workflow.env` → `.agents/docs/agents/github-workflow.env`
- `docs/agents/github-workflow-migration.md` →
  `.agents/docs/agents/github-workflow-migration.md`

`docs/` is for user-facing documentation (features, setup, development commands,
layout) and is hand-maintained. It must not be used to store agent instructions.

## Consequences

- Every reference to an agent-facing document is relative to `.agents/`. The
  GitHub workflow skills' config contract points at
  `.agents/docs/agents/github-workflow.env`; a consuming repository that vendors
  the package puts its overrides there.
- The skill validator's "no repository-specific leakage" check treats a
  reference to `.agents/docs/` as the sanctioned convention rather than a leak,
  so skills may name the config file by its conventional path.
- Adding agent-facing documentation means adding it under `.agents/`, and adding
  an ADR when the decision is not obvious from the file itself.