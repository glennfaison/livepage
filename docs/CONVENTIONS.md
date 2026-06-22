# LivePage Conventions

- Prefer Zod schemas for runtime validation and parsing when repeated `if` checks are guarding an object shape we already expect.
- When launching parallel agents or sub-agents, use the cheapest model that can do the job; only choose a larger model if the task truly needs it.
- Avoid `useEffect` unless you are synchronizing with an external system; prefer deriving data during render, event handlers, or other React patterns first.
- Prefer plain presentational components plus orchestrator components and custom hooks over components that mix lots of hooks and JSX in one place.
