# Agent workflow

How to scope, verify, and finish a task in this repository. For what the code should look like, see [the conventions](./CONVENTIONS.md). For commands, see the [README](../README.md#development).

## Scope

- **Redesign over minimal diffs.** Do not optimize for the smallest diff. After a change, the code you touched should look as it would if it had been designed strategically from scratch with this requirement in mind. Refactor, rename, extract, and restructure the affected code and its callers whenever that yields a cleaner result than patching around the old shape. This rule takes priority over the two bullets below and over any instinct to keep a change small. Only explicit user requirements (see the last bullet) override it. It does not license unrelated rewrites of code the task has no reason to touch.
- Prefer to keep focused UI fixes inside the existing feature boundary, but cross it when the redesign rule calls for it. Follow the module-boundary rules in [the conventions](./CONVENTIONS.md) when you do.
- Do not create an ADR or a planning document for a focused task unless the user explicitly asks for one. A new abstraction is welcome when it generalizes existing special cases or deepens a module, as [the conventions](./CONVENTIONS.md) describe.
- Treat explicit layout and DOM-structure requirements as binding. Preserve the existing decorator structure unless a broader redesign is requested. For example, do not replace a requested `display: contents` wrapper with a semantic wrapper or a new overlay architecture, and keep editor controls simple.

## Verify

- Run the narrowest relevant Jest selector first, for example `npm test -- --runInBand path/to/test.test.tsx`, then broader checks.
- Record known baseline failures separately. Do not treat unrelated user-modified expectations as regressions.
- Restart the development server before browser testing so the browser validates the current application state.
- For editor controls, decorators, and other positioned UI, check real geometry after scroll and resize. Also check client-only and portal rendering for SSR and hydration safety. Passing TypeScript is not enough.
- When merging a module's exports into a barrel, run the narrowest relevant Jest selector. Eager circular imports can throw at runtime even when `tsc` reports no errors.
- UI work is not done until you have seen it in a browser. For Templates, judge the preview-mode render (`/try?template=<id>&mode=preview`), not the code or edit mode. Follow the [template skills](../.github/skills/template-authoring/SKILL.md).

## Finish

- Ship Template changes in a pull request, never straight to `main`.
- Check whether the change introduces or renames entities, relationships, or domain terms. If it does, update [the glossary](./GLOSSARY.md) before finishing.

## Sub-agents

- For parallel agents or sub-agents, use the lowest-cost model that still meets the task's quality and context requirements. Upgrade only if needed.
