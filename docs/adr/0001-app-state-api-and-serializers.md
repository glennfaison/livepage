# App-state API and serializers

**Status:** Accepted

We are organizing the builder around a central **app state** boundary with a command/selector API, and moving format-specific transformations into dedicated **serializers** for JSON, shortcode, and HTML. This keeps the core state model immutable at the boundary, makes format handling symmetric, and avoids scattering persistence/export logic across UI components and hooks.

## Implementation

- The app-state API is implemented in [`features/app-state/`](../../features/app-state/), with commands, reducer helpers, and selectors.
- Serializers are implemented in [`features/serializers/`](../../features/serializers/), with separate JSON, shortcode, and HTML modules.
- Runtime validation for serialized app-node trees is centralized in [`features/serializers/schema.ts`](../../features/serializers/schema.ts).
- Shared readonly app-state and feature-facing types are defined in [`features/types.ts`](../../features/types.ts).
