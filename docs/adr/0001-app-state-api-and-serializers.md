# App-state API and serializers

**Status:** Accepted

We are organizing the builder around a central **app state** boundary with a command/selector API, and moving format-specific transformations into dedicated **serializers** for JSON, shortcode, and HTML. This keeps the core state model immutable at the boundary, makes format handling symmetric, and avoids scattering persistence/export logic across UI components and hooks.

## Implementation

- The app-state API is implemented in [`shared/features/app-state/`](../../shared/features/app-state/), with commands, reducer helpers, and selectors. The React hook facade lives in [`client/features/app-state/`](../../client/features/app-state/).
- Serializers are implemented in [`client/features/serializers/`](../../client/features/serializers/), with separate JSON, shortcode, and HTML modules.
- Runtime validation for serialized app-node trees is centralized in [`shared/features/serializers/schema.ts`](../../shared/features/serializers/schema.ts).
- Shared readonly app-state and feature-facing types are defined in [`shared/features/types.ts`](../../shared/features/types.ts).

## Standalone HTML export

The HTML serializer produces a standalone document rather than a server-rendered
snapshot. It embeds the validated app-node tree as JSON and an inline browser runtime,
which renders the registered preview component set without depending on the builder's
Next.js bundle. The runtime uses pinned React and ReactDOM ESM imports (`19.1.0`) from
esm.sh, so exported files intentionally require network access when opened.

Data-source settings remain in the tree. The browser runtime supports the built-in
generated-data and REST API sources, resolves data-source and current-date placeholders,
and renders loading/error states. As with preview mode, REST sources must permit the
exported page's browser origin via CORS, and generated-data/parse functions are trusted
code supplied by the page author.
