# Shared preview renderer

**Status:** Accepted

Preview rendering is defined by the browser-safe component registry and its
`PreviewModeComponent` implementations. Component definitions live under
[`client/features/design-components/definitions/`](../../client/features/design-components/definitions/);
registry and preview-runtime code lives under
[`client/features/design-components/`](../../client/features/design-components/).
Data-source behavior belongs to [`client/features/data-sources/`](../../client/features/data-sources/),
while editor-only decorators belong to
[`client/features/design-components/editor-controls/decorators/`](../../client/features/design-components/editor-controls/decorators/).

The editor wraps shared preview components with selection, editing, and layout
controls. Standalone HTML exports bundle the same `PreviewRenderer`, component
registry, and preview implementations using the HTML runtime build script, then
render the serialized app-node tree in the browser. The generated artifact includes
the CSS compiled from the app's global Tailwind entry point, so component styles
also come from the same source. Export code must not add a parallel per-tag
renderer or hand-maintained component stylesheet.

The parity contract is the initial content and layout of each registered bundled
template at desktop and mobile viewport sizes. Browser tests compare the actual
`/try?template=<id>&mode=preview` page with the exact HTML serializer output. Live
data-source states and pixel-identical page-shell height are not part of the
contract; exports also remain dependent on pinned external React ESM and Inter
font assets.
