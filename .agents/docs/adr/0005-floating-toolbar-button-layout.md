# Floating toolbar button layout

**Status:** Accepted

The floating page-builder toolbar is a single row of icon-only buttons
arranged around a centered minimize/maximize pivot. The buttons are evenly
distributed between the left and right of the pivot, so the row stays visually
balanced no matter how many controls are present.

## Layout rule

Let `L` be the number of buttons to the left of the minimize/maximize button,
and `R` the number to its right. `L - R` must be `-1`, `0`, or `1`. Any other
value is a bug and must be fixed. This is enforced by
`assertToolbarButtonBalance` in `client/features/page-builder/toolbar.tsx` and
covered by a unit test.

The pivot is the minimize button in expanded mode and the maximize button in
minimized mode. Drag handles are not counted as buttons.

## Current arrangement (expanded mode)

- **Left of pivot (5):** command palette, AI assistant, history, undo, redo
- **Pivot:** minimize
- **Right of pivot (5):** save, discard, duplicate page, settings, layout toggle

`L - R = 0`, which is valid. With the AI assistant button hidden the row is
4 vs 5, so `L - R = -1`, also valid.

The counts are computed from the buttons the component actually renders and
passed to `assertToolbarButtonBalance` on every render outside production, so a
button added on one side without rebalancing fails fast.

## Current arrangement (minimized mode)

- **Left of pivot (0):** drag handle (not counted as a button)
- **Pivot:** maximize
- **Right of pivot (0):** drag handle (not counted as a button)

`L - R = 0`, which is valid. The minimized toolbar shows the maximize pivot
only; undo/redo stay reachable through their keyboard shortcuts.

## Rationale

- **Balance.** Even distribution keeps the toolbar from leaning to one side as
  controls are added or removed, which is what happened before: the row grew
  asymmetrically as new buttons were appended to the right.
- **Stability.** A fixed rule is easier to maintain than eyeballing the layout.
  Adding a button means moving another one across the pivot, not just appending
  it.
- **Discoverability.** Icon-only buttons keep the toolbar compact; tooltips
  expose the action and its keyboard shortcut on hover, as before.

## Consequences

- Adding a new toolbar button requires rebalancing the row so `L - R` stays in
  range. The assertion makes an imbalance a runtime error during development
  rather than a silent visual defect.
- The layout toggle moved from the left of the pivot to the right to keep the
  row balanced after the copy/paste buttons were removed.

## Supersedes

- [ADR 0003 — Toolbar button layout](./0003-toolbar-icon-buttons.md) established
  the icon-only, centered-pivot look. This ADR adds the explicit balance rule
  that 0003 described only by example.