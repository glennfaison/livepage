# Shared agent skills are pinned submodules, exposed by symlinks

**Status:** Superseded by [ADR 0012](./0012-agent-skills-via-npx-skills.md)

Two skill sets are not written in this repository: Matt Pocock's skills and
Fallow's. They
change on their own schedule and other repositories use them too.

## Decision

- Each is a git submodule under `.agents/skills/`, pinned to a commit.
- A harness such as Kilo Code finds skills one level deep in `.agents/skills/`,
  and a package may group its skills in buckets. So every skill that
  agents must find by name has a committed relative symlink in `.agents/skills/`.
- Documentation refers to a skill by its name or its `.agents/skills/<name>/`
  path, never by a path inside a submodule. A package that renames its buckets
  then breaks nothing here except the links.

## Consequences

- A clone has empty skill folders and dangling links until
  `git submodule update --init --recursive` runs. `AGENTS.md` requires it at
  session start.
- A runner that reads the repository through a GitHub connector sees only the
  submodule pointer.
- To update a package, update its submodule and commit the pointer and links.
- A fix to a skill is made in the package repository, not here.
