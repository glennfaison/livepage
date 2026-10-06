# Toolbar button layout

**Status:** Accepted

The floating page-builder toolbar now uses **icon-only buttons** arranged with the minimize/maximize control centered and **three action buttons on each side**. This replaces the earlier layout where buttons carried visible text labels and were grouped in separate containers, which made them wider than necessary and visually unbalanced.

## Rationale

- **Compactness.** Removing the text labels and shortcut hints from the toolbar buttons reduces their width, keeping the toolbar from dominating the viewport on small screens.
- **Symmetry.** Placing the minimize/maximize button in the center with three action buttons on each side creates a balanced visual weight that is easier to scan.
- **Tooltips preserve affordance.** Icon-only buttons still expose their action through the native `title` tooltip, so discoverability is preserved without permanent labels.

## Implementation

- The toolbar now renders a single flex row (or column in vertical layout) containing:
  - drag handle
  - command palette, history, settings buttons
  - minimize/maximize button
  - save, discard, layout-toggle buttons
  - drag handle
- Text spans and shortcut-hint components were removed from the buttons.
- Undo/redo remain accessible through keyboard shortcuts (`useUndoShortcut`, `useRedoShortcut`) but no longer have dedicated toolbar buttons.

## Consequences

- Screen-reader users still get accessible names from the `title` attributes and from the `aria-label` values on the underlying button components.
- Keyboard-shortcut discovery shifts from visible labels to tooltips and the command palette.
