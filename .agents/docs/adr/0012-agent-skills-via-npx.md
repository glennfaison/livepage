# Shared agent skills are installed with npx skills and committed

**Status:** Accepted

**Supersedes:** [ADR 0011](./0011-agent-skills-as-submodules.md)

Three external skill packs are not authored in this repository: `glennfaison/github-agent-workflow`, Matt Pocock's engineering skills (`mattpocock/skills`), and Fallow's (`fallow-rs/fallow-skills`). They change on their own schedule and other repositories use them too.

## Decision

- Install each pack with the skills CLI (`npx skills@latest add … --copy`) so skill folders land under `.agents/skills/` as ordinary files.
- Commit those folders and `skills-lock.json` so a clone has working skills without submodule init.
- Keep LivePage-only skills (for example `livepage-code-review`, `ask-glenn`, template skills) as first-class directories next to the installed ones.
- Prefer Matt Pocock's `code-review` for general standards-and-spec review; keep `livepage-code-review` for this repository's architecture and convention checks (name chosen to avoid clashing with Matt's skill).

## Consequences

- Session start no longer runs `git submodule update`.
- Refreshing a pack is a deliberate `npx skills add` plus commit of the skill tree and lockfile.
- Harnesses that discover skills one level deep under `.agents/skills/` find them without symlink indirection.
- Grok connector prompts can read `.agents/skills/<name>/SKILL.md` directly from this repository.
