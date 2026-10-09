# Format painter (component style copy/paste) — Not implemented

**Status:** Rejected (wontfix)

## Context

Issue #216 requested a format painter feature: copy styles from one component and paste to another, with keyboard shortcuts (`⌘⌥C` / `⌘⌥V`) and toolbar buttons.

## Decision

Do not implement format painter. The feature is rejected (wontfix).

## Rationale

1. **No implementation exists** — The issue was closed but no code was ever written. The feature never shipped.

2. **Attribute complexity** — Components have heterogeneous attribute schemas (spacing, colors, typography, custom classes, data bindings). A generic "copy all stylable attributes" requires per-component-type compatibility mapping that doesn't exist and would be fragile.

3. **Design system direction** — The app uses a component registry with defined metadata. Styling is primarily done via the component's settings popover (which already supports copying individual values). A format painter bypasses the intentional attribute model.

4. **Low ROI** — The workaround is simple: open settings on source component, copy values manually, paste into target. The command palette and settings popover already support this workflow.

5. **Maintenance burden** — Adding format painter would require:
   - New reducer actions (`COPY_COMPONENT_STYLES`, `PASTE_COMPONENT_STYLES`)
   - New hooks (`useFormatPainter`)
   - Keyboard shortcut module additions
   - Toolbar buttons with state (copied styles indicator)
   - Per-component attribute filtering logic
   - Test coverage for edge cases (incompatible types, nested components)

## Consequences

- Users continue to copy/paste individual style values via settings popover
- Command palette and keyboard shortcuts remain uncluttered
- No format painter state to synchronize across toolbar, canvas, and settings

## Related

- Closes #216 (wontfix)
- Supersedes any future requests for format painter unless a concrete use case justifies the complexity