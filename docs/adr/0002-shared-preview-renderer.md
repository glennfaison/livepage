# Shared preview renderer

**Status:** Accepted

Preview rendering is defined by a browser-safe component registry and shared
`PreviewModeComponent` implementations. Component definitions live under
`client/features/design-components/definitions/`; registry and preview-runtime
code lives under `client/features/design-components/`. Data-source behavior
belongs to `client/features/data-sources/`, while editor-only decorators
belong to `client/features/design-components/editor-controls/decorators/`.

The editor may wrap shared preview components with selection, editing, and
layout controls, while other consumers use the shared preview layer; this
avoids recursive module loading and gives HTML export a stable parity boundary
without stringifying React functions.

The current HTML serializer still emits a format-neutral static document. A
future export-runtime bundle can consume the same preview registry directly.
