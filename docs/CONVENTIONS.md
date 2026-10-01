# Code conventions

Rules for how code in this repository is written. For how to scope and verify a task, see [the agent workflow](./AGENT-WORKFLOW.md).

## Design principles

- **Generalize instead of special-casing.** When a new requirement looks like a one-off, first look for the more general rule that covers it and its existing special cases. Extend or replace the existing mechanism rather than adding another branch. Do not add a conditional for a specific tag, template, or caller if a data-driven or parameterized approach handles it.
- **Build deep modules.** A module or class should hide substantial functionality behind a small, general-purpose interface. Expose as few methods and properties as possible, and make each one broadly useful rather than tailored to one caller. The Unix file API is the model: `open`, `close`, `seek`, `read`, and `write` hide buffering, devices, permissions, and filesystems. Design from the top down: decide the interface a consumer would want first, then put the complexity behind it. Split modules along purposeful boundaries, not just to make files smaller.
- **Use guard clauses.** Handle invalid, empty, and edge cases first with an early `return`, `continue`, or `throw`, so the main path stays at the top indentation level. Avoid nested `if` statements and nested loops where an early exit or an extracted function flattens them.

## Validation and serialization

- Prefer Zod for runtime validation and parsing when the same object-shape checks repeat across call sites.
- Keep format-specific parsing and serialization in [`features/serializers/`](../features/serializers/). Validate external app-node trees with the shared Zod schema in [`features/serializers/schema.ts`](../features/serializers/schema.ts).

## State

- Keep the component tree as readonly `AppNode` data. Create and update nodes through the app-state API and the actions exposed by [`features/app-state/`](../features/app-state/).
- Editor-facing operations and canvas rendering belong to [`features/page-builder/`](../features/page-builder/). Consume them through its public entry points, [`index.ts`](../features/page-builder/index.ts) (including `CanvasRenderer`, `Toolbar`, and operational hooks) and [`editor-controls.ts`](../features/page-builder/editor-controls.ts), not through internal hooks, decorators, or component definitions.
- Domain features must not import upward from the application shell (`app/*`). Shared domain constants (such as data-source attribute keys) belong to their owning domain module (`features/data-sources/`).

## React

- Avoid `useEffect`. Before writing or keeping one, read [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) and choose an approach that does not need one: derive data during render, compute it with `useMemo`, handle it in an event handler, or reset state with a `key`. Use `useEffect` only to synchronize with external systems such as subscriptions, timers, DOM APIs, or network requests.
- When you touch a component that has an unnecessary `useEffect`, refactor it away. When an effect is genuinely needed but is more than a few lines, extract it into a named custom hook.
- Pair presentational components with custom hooks. A presentational component receives props and returns markup. A custom hook owns the state, data fetching, and computation behind it. Do not let one component combine several hooks and non-trivial computation with its JSX. Where a screen needs wiring, use a thin orchestrator component that calls the hook and passes the result to the presentational component.
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

- **Server-only modules.** A module that reads secrets (for example [`lib/jev`](../lib/jev/) and [`lib/openai`](../lib/openai/)) imports `server-only` and has no client barrel. If a feature has both client and server halves, give it two entry points: `index.ts` (client-safe) and `server.ts`. Route handlers import only the server entry.
- **State-free entry points.** [`features/app-state/tree.ts`](../features/app-state/tree.ts) exposes pure tree helpers without the reducer, so low-level modules such as `templates` can use them without loading the editor.
- **Route handlers and the component registry.** The registry loads React component definitions and cannot be imported into a route handler. Derive anything the server needs from the registry in the browser and send the result.

### Module Decoupling and DAG Rules

Maintain a strict Directed Acyclic Graph across modules:

- **`app-state` has zero UI dependencies.** It never imports `design-components` or `page-builder`. Component creation occurs in the caller (`features/page-builder/hooks.ts`) and is passed to `INSERT_COMPONENT` or `REPLACE_COMPONENT`.
- **`data-sources` has zero component dependencies.** It depends only on `features/placeholders` and `features/types`.
- **`design-components` is self-contained.** Component definitions, preview rendering, and edit-mode controls (`withEditorControls`, `withTextEditing`, divider, settings popovers) live entirely inside `features/design-components/` and do not import from `features/page-builder`.
- **`page-builder` is a one-way consumer.** It consumes `features/app-state` and `features/design-components`, orchestrating the visual workspace.
- **Entry point discipline.** Each feature exposes its primary public API via `index.ts`. Client/server split features (`features/prompt-assist`) provide `index.ts` for client code and `server.ts` for server route handlers. Server routes must not import client barrels.

