# Agent workflow

How to scope, verify, and finish a task in this repository. For what the code should look like, see [the conventions](./CONVENTIONS.md). For commands, see the [README](../README.md#development).

## Scope

- Keep focused UI fixes inside the existing feature boundary.
- Do not create an ADR, a planning document, or a new architectural abstraction for a focused task unless the user explicitly asks for one.
- Treat explicit layout and DOM-structure requirements as binding. Preserve the existing decorator structure unless a broader redesign is requested. For example, do not replace a requested `display: contents` wrapper with a semantic wrapper or a new overlay architecture, and keep editor controls simple.

## Verify

- Run the narrowest relevant Jest selector first, for example `npm test -- --runInBand path/to/test.test.tsx`, then broader checks.
- Record known baseline failures separately. Do not treat unrelated user-modified expectations as regressions.
- Restart the development server before browser testing so the browser validates the current application state.
- For editor controls, decorators, and other positioned UI, check real geometry after scroll and resize. Also check client-only and portal rendering for SSR and hydration safety. Passing TypeScript is not enough.
- When merging a module's exports into a barrel, run the narrowest relevant Jest selector. Eager circular imports can throw at runtime even when `tsc` reports no errors.

## Finish

- Check whether the change introduces or renames entities, relationships, or domain terms. If it does, update [the glossary](./GLOSSARY.md) before finishing.

## Sub-agents

- For parallel agents or sub-agents, use the lowest-cost model that still meets the task's quality and context requirements. Upgrade only if needed.
