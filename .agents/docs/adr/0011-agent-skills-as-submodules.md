# Shared agent skills are pinned submodules, exposed by symlinks

**Status:** Accepted

Three skill sets are not written in this repository: the GitHub workflow
(`glennfaison/github-agent-workflow`), Matt Pocock's skills, and Fallow's. They
change on their own schedule and other repositories use them too.

## Decision

- Each is a git submodule under `.agents/skills/`, pinned to a commit.
- A harness such as Kilo Code finds skills one level deep in `.agents/skills/`,
  and the workflow package groups its skills in buckets. So every skill that
  agents must find by name has a committed relative symlink in `.agents/skills/`.
  The package's `scripts/link-skills.sh` makes the links for its own skills;
  `tdd`, from another submodule, is linked by hand.
- Documentation refers to a skill by its name or its `.agents/skills/<name>/`
  path, never by a path inside a submodule. A package that renames its buckets
  then breaks nothing here except the links.
- The workflow's settings stay in this repository, in
  `.agents/docs/github-agent-workflow.env`. The package holds nothing specific
  to LivePage.

## Consequences

- A clone has empty skill folders and dangling links until
  `git submodule update --init --recursive` runs. `AGENTS.md` requires it at
  session start, and a scheduled runner runs it in its setup commands.
- A runner that reads the repository through a GitHub connector sees only the
  submodule pointer. It reads the skills from the package repository at the
  pinned commit instead ([AUTOMATIONS.md](../AUTOMATIONS.md)).
- To update the package:
  `git submodule update --remote .agents/skills/github-agent-workflow`, then
  `.agents/skills/github-agent-workflow/scripts/link-skills.sh`. Commit the
  pointer and the links, and change `REF` in `AUTOMATIONS.md` to the new commit.
- A fix to a skill is made in the package repository, not here.
