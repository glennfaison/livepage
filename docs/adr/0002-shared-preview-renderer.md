# Shared preview renderer

**Status:** Accepted

Preview rendering is defined by a browser-safe component registry and shared
`PreviewModeComponent` implementations. Component definitions live under
`features/design-components/definitions/`; registry and preview-runtime code
lives under `features/design-component-runtime/`. Data-source behavior belongs
to `features/data-sources/`, while editor-only decorators belong to
`features/page-builder/decorators/`.

The editor may wrap shared preview components with selection, editing, and
layout controls, while other consumers use the shared preview layer; this
avoids recursive module loading and gives HTML export a stable parity boundary
without stringifying React functions.

The current HTML serializer still emits a format-neutral static document. A
future export-runtime bundle can consume the same preview registry directly.
