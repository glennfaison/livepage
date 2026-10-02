# Code conventions

Rules for how code in this repository is written. For how to scope and verify a task, see [the agent workflow](./AGENT-WORKFLOW.md).

## Design principles

- **Generalize instead of special-casing.** When a new requirement looks like a one-off, first look for the more general rule that covers it and its existing special cases. Extend or replace the existing mechanism rather than adding another branch. Do not add a conditional for a specific tag, template, or caller if a data-driven or parameterized approach handles it.
- **Build deep modules.** A module or class should hide substantial functionality behind a small, general-purpose interface. Expose as few methods and properties as possible, and make each one broadly useful rather than tailored to one caller. The Unix file API is the model: `open`, `close`, `seek`, `read`, and `write` hide buffering, devices, permissions, and filesystems. Design from the top down: decide the interface a consumer would want first, then put the complexity behind it. Split modules along purposeful boundaries, not just to make files smaller.
- **Use guard clauses.** Handle invalid, empty, and edge cases first with an early `return`, `continue`, or `throw`, so the main path stays at the top indentation level. Avoid nested `if` statements and nested loops where an early exit or an extracted function flattens them.

## Validation and serialization

- Prefer Zod for runtime validation and parsing when the same object-shape checks repeat across call sites.
- Keep format-specific parsing and serialization in [`client/features/serializers/`](../client/features/serializers/). Validate external app-node trees with the Zod schema in [`client/features/serializers/schema.ts`](../client/features/serializers/schema.ts).

## State

- Keep the component tree as readonly `AppNode` data. Create and update nodes through the client app-state API in [`client/features/app-state/`](../client/features/app-state/), including pure tree lookups.
- Editor-facing operations and canvas rendering belong to [`client/features/page-builder/`](../client/features/page-builder/). Consume them through its public entry point, [`index.ts`](../client/features/page-builder/index.ts) (including `CanvasRenderer`, `Toolbar`, operational hooks, and the re-exported editor controls from [`client/features/design-components/editor-controls/`](../client/features/design-components/editor-controls/)), not through internal hooks, decorators, or component definitions.
- Domain features must not import upward from the application shell (`app/*`). Runtime-specific constants belong with their owning client or server feature; move a constant to `shared/` only when both runtimes use it.

## React

- Avoid `useEffect`. Before writing or keeping one, read [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) and choose an approach that does not need one: derive data during render, compute it with `useMemo`, handle it in an event handler, or reset state with a `key`. Use `useEffect` only to synchronize with external systems such as subscriptions, timers, DOM APIs, or network requests.
- When you touch a component that has an unnecessary `useEffect`, refactor it away. When an effect is genuinely needed but is more than a few lines, extract it into a named custom hook.
- Pair presentational components with custom hooks. A presentational component receives props and returns markup. A custom hook owns the state, data fetching, and computation behind it. Do not let one component combine several hooks and non-trivial computation with its JSX. Where a screen needs wiring, use a thin orchestrator component that calls the hook and passes the result to the presentational component.
- Compose cross-cutting behavior with decorators in the owning feature: data-source resolution through the [`client/features/data-sources/`](../client/features/data-sources/) public API, and text editing and editor controls through [`client/features/page-builder/index.ts`](../client/features/page-builder/index.ts).

## Design components and styling

- Register design components through metadata in [`client/features/design-components/definitions/`](../client/features/design-components/definitions/), not through tag-specific switch statements in consumers.
- When improving UI, first add or change the component's settings or attributes (spacing, variants, other configuration).
  - Use custom classes only for one-off layout adjustments the component model cannot express.
  - Do not bake template-specific fixes into a default component unless it renders incorrectly by default.

## Runtime and module boundaries

- [`client/`](../client/), [`server/`](../server/), and [`shared/`](../shared/) are runtime boundaries. Client and server code may both depend on shared code, but they must never import from each other.
- Keep `shared/` runtime-neutral and minimal: no React components, browser APIs, secrets, `server-only`, or server framework dependencies. Put browser features under `client/features/`, backend features under `server/features/`, and keep code in `shared/features/` only when both runtimes consume the same contract or data.
- Treat each feature folder as a module boundary. Expose its public surface through `index.ts`, or a few deliberate entry files such as [`client/features/page-builder/index.ts`](../client/features/page-builder/index.ts). Other features import those entry points rather than sibling internals.
- If a feature has browser and server behavior, keep the implementations in the corresponding runtime tree and put only their shared contracts in `shared/`. The prompt-assist client entry is [`client/features/prompt-assist/index.ts`](../client/features/prompt-assist/index.ts), the server entry is [`server/features/prompt-assist/index.ts`](../server/features/prompt-assist/index.ts), and shared contracts are in [`shared/features/prompt-assist/`](../shared/features/prompt-assist/). Server handlers must receive validated, bounded data rather than importing client-owned features.
- Server-only integrations and infrastructure live in [`server/`](../server/), import `server-only` when they access secrets or otherwise must not enter a client bundle, and expose no client barrel.
- Keep pages and API route handlers in Next.js's supported [`app/`](../app/) route tree. Page modules call into `client/`; API route files are thin backend adapters that call into `server/`.
- The component registry loads React definitions and cannot be imported into a route handler. Derive anything the server needs from the registry in the browser and send the result.
- App-state helpers, types, and validation are client-owned; the server must not depend on them.

### Module Decoupling and DAG Rules

Maintain a strict Directed Acyclic Graph across runtime and domain modules:

- **`client/features/app-state` owns editor state behavior.** App-state commands, types, tree lookup, and component creation remain in the client.
- **Data-source constants** live in `client/features/data-sources/`; only types or constants needed by both runtimes belong in `shared/features/`.
- **`client/features/design-components` is self-contained.** Component definitions, preview rendering, and edit-mode controls (`withEditorControls`, `withTextEditing`, divider, settings popovers) live there and do not import from `client/features/page-builder`.
- **`client/features/page-builder` is a one-way consumer.** It consumes client app-state and design components, orchestrating the visual workspace.
- **Entry point discipline.** Each feature exposes its public API through `index.ts`. Runtime-specific feature entry points stay in their matching tree; server routes must not import client barrels.
