# Insertion dividers are overlays, not flex items

**Status:** Accepted. Supersedes the shown-divider parts of [ADR 0014](./0014-divider-thickness-pinned-inline.md) and [ADR 0015](./0015-dividers-are-layout-neutral.md). Issue #466.

Issue #466: shown insertion dividers are real flex items interleaved between row and column children. They take a flex slot, use negative margins of `(gap + thickness) / -2` to cancel their own space, and shift siblings under `justify-content: space-between | around` (about 21 uses in the bundled templates). Because the shown divider moves the child under the cursor, the 30% / 70% edge check can flip-flop and the divider flickers while the pointer moves. Only the "+" button is clickable; clicking the bar itself does nothing.

## Decision

- **Rows and columns render no divider elements inside the flex container.** The `intersperseAndAppend` divider interleaving is removed from `row.tsx` and `column.tsx`, so the children are the only DOM children (plus existing empty-state content). Edit-mode layout is identical to preview for any `gap` and any `justify-content`.
- **The active divider is drawn as an overlay portalled to `document.body`** (like `EditorOverlay`, ADR 0016) and placed from the hovered child's own box via `useElementBox`. A 2px bar with a centered "+", anchored to the hovered child's own edge (start or end along the main axis), so wrapped rows have no ambiguity at line breaks and an overlay cannot cause a row to wrap.
- **`useDividerVisibility` is unchanged** (30% / 70% edge logic and the 250 ms hide delay). Only the rendering moves from interleaved flex items to a portal overlay.
- **The whole bar is a real `<button>`** with `aria-label="Add component here"` that opens the component selector popover. The "+" is the visual cue. The button's hit area is wider than the 2px bar (8px), which costs no layout because the overlay is out of flow.
- **Removed:** `resolveMainAxisGap`, `getDividerLayoutStyle`, `getDividerThicknessStyle`, the old interleaved `Divider` component, the free-text `gap` parsing, and the pinned-thickness inline styles, along with their unit tests. The `DIVIDER_THICKNESS_PX` constant (2px) and `useDividerContrastColor` are retained for the overlay bar.

## Consequences

- Dividers can no longer shift siblings, so `justify-content: space-between | around` rows, wrapping rows, and columns are layout-neutral in edit mode.
- The free-text `Gap` setting no longer has to be parsed for divider layout; the divider is placed from the child's real box.
- Clicking anywhere on the divider bar (not only "+") opens the component selector and inserts the component at the correct index.
- Unit tests cover the overlay's position math with mocked `getBoundingClientRect`; the removed helpers' tests are deleted.

## Visual verification

Hover a child's edge in Edit Mode on any bundled template (including `farm-logistics-landing-page` with `justify-content: space-between` rows and a wrapping row): a 2px divider bar appears at the child's edge, does not move surrounding elements, and clicking anywhere on it opens the component selector.
