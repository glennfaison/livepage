# LivePage Conventions

- Prefer Zod for runtime validation and parsing when the same object-shape checks repeat across call sites.
- For parallel agents or sub-agents, use the lowest-cost model that still meets the task's quality and context requirements; upgrade only if needed.
- Use `useEffect` only to synchronize with external systems, such as subscriptions, timers, DOM APIs, or network requests. Derive data during render or handle it in event handlers. (Reference: https://react.dev/learn/you-might-not-need-an-effect)
- Split complex UI into presentational components, orchestrator components, and custom hooks. Avoid components that combine data fetching, state coordination, and rendering in one file.
- Register design components through metadata in [`features/design-components/`](../features/design-components/) rather than adding tag-specific switch statements to consumers.
- Keep the component tree as readonly `AppNode` data; create and update nodes through the app-state API and dispatch actions exposed by [`lib/store/hooks.ts`](../lib/store/hooks.ts).
- Compose cross-cutting design-component behavior with the existing decorators, such as data-source resolution, text editing, and editor controls, instead of duplicating it in each component.
- Keep format-specific parsing and serialization in [`features/serializers/`](../features/serializers/); validate external app-node trees with the shared Zod schema.
