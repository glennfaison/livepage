# Code conventions

Rules for how code in this repository is written. For how to scope and verify a task, see [the agent workflow](./AGENT-WORKFLOW.md).

## Validation and serialization

- Prefer Zod for runtime validation and parsing when the same object-shape checks repeat across call sites.
- Keep format-specific parsing and serialization in [`features/serializers/`](../features/serializers/). Validate external app-node trees with the shared Zod schema in [`features/serializers/schema.ts`](../features/serializers/schema.ts).

## State

- Keep the component tree as readonly `AppNode` data. Create and update nodes through the app-state API and the actions exposed by [`features/app-state/`](../features/app-state/).
- Editor-facing operations belong to [`features/page-builder/`](../features/page-builder/). Consume them through its public entry points, [`index.ts`](../features/page-builder/index.ts) and [`editor-controls.ts`](../features/page-builder/editor-controls.ts), not through the internal `hooks.ts` or `decorators/` files.

## React

- Use `useEffect` only to synchronize with external systems such as subscriptions, timers, DOM APIs, or network requests. Derive data during render or handle it in event handlers. See [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).
- Split complex UI into presentational components, orchestrator components, and custom hooks. Avoid components that combine data fetching, state coordination, and rendering in one file.
- Compose cross-cutting behavior with decorators in the owning feature: data-source resolution through the [`features/data-sources/`](../features/data-sources/) public API, and text editing and editor controls through [`features/page-builder/editor-controls.ts`](../features/page-builder/editor-controls.ts).

## Design components and styling

- Register design components through metadata in [`features/design-components/definitions/`](../features/design-components/definitions/), not through tag-specific switch statements in consumers.
- When improving UI, first add or change the component's settings or attributes (spacing, variants, other configuration).
  - Use custom classes only for one-off layout adjustments the component model cannot express.
  - Do not bake template-specific fixes into a default component unless it renders incorrectly by default.

## Module boundaries

- Treat each folder under [`features/`](../features/) as a module boundary. Expose its public surface through a top-level `index.ts`, or through a few deliberately named entry files such as [`editor-controls.ts`](../features/page-builder/editor-controls.ts). Other modules import only from those entry points, never from a sibling's internal files, definitions, components, or hooks.
- If a module has no `index.ts`, add one before adding new cross-module consumers.
- If a consumer needs something that is not exported yet, add it to the module's entry point. Do not add a deep-import exception, even for one case.
- Before restructuring a module's public API, audit existing cross-module imports (for example `rg 'from "@/features/<module>/'` outside that module's folder) and fix every violation in the same change.

### Import cycles

Avoid the following cycles by keeping these boundaries:

- **`design-components` → `page-builder` → `app-state` → `design-components`.** Definitions in `features/design-components/definitions/` must not import `features/page-builder/decorators/*` or `features/page-builder/hooks.ts`. Use `editor-controls.ts` instead.
- **`design-component-runtime` → `design-components` → `page-builder` → `design-component-runtime`.** [`features/design-component-runtime/`](../features/design-component-runtime/) has two entry points:
  - [`index.ts`](../features/design-component-runtime/index.ts) exposes the registry, `createDesignComponentInstance`, and `PreviewRenderer`. It is for consumers outside the assembly cycle.
  - [`primitives.ts`](../features/design-component-runtime/primitives.ts) exposes the attribute-builder helpers, the registered-component lookup, `componentTagList`, and browser-safe data-source property substitution. Definitions in `features/design-components/definitions/`, and the dependents of `features/page-builder/editor-controls.ts`, import from here and must not import the full `index.ts`.
- **When consolidating exports into a barrel**, check that no export transitively depends on a module that depends back on the current one, directly or through another feature. If one does, split the barrel into narrower entry points (for example a state-free surface and a state-aware surface) instead of forcing everything through one file.
