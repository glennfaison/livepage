# Shared agent skills are committed `npx skills` installs

**Status:** Accepted. Supersedes [ADR 0011](./0011-agent-skills-as-submodules.md).

Two skill sets are not written in this repository: Matt Pocock's skills
(`mattpocock/skills`) and Fallow's (`fallow-rs/fallow-skills`). Submodules left skill folders empty
until initialised, needed hand-made symlinks, and hid the skills from runners
that read the repository through a connector.

## Decision

- Install each set with the skills CLI (`npx skills@latest add <source> --skill ... -y --copy`)
  and commit the resulting folders in `.agents/skills/` plus `skills-lock.json`.
  The exact commands are in [AGENTS.md](../../../AGENTS.md#skills).
- There are no submodules and no symlinks into them. Skills are referred to by name
  or by their `.agents/skills/<name>/` path.
- The repository's own review skill is `livepage-code-review`, so it does not clash with
  Matt Pocock's `code-review`. Use `/code-review` for general standards-and-spec review
  and `/livepage-code-review` for LivePage architecture and conventions.
- `.grok/`, which the CLI may write, is not committed.

## Consequences

- A clone has every skill with no setup step; runners and connectors read skills from this repository.
- To refresh a set, re-run its install command and commit the changes and the lock file.
- A fix to an installed skill is made in its source repository, not here.
