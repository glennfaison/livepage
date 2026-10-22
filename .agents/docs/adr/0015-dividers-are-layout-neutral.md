# Insertion dividers are layout-neutral in edit mode

**Status:** Accepted. Amends [ADR 0014](./0014-divider-thickness-pinned-inline.md) (hidden state and
margins only; the pinned thickness and the out-of-flow "+" button still apply).

Issue #431: rows and columns laid out differently in Edit Mode than in Preview Mode
(`farm-logistics-landing-page`: 528px vs 456px). Edit mode interleaves a divider between every pair
of children. Each divider is a flex item, and `gap` applies between every adjacent pair of flex
items, so every divider added two extra gaps even at zero size.

## Decision

- **Hidden dividers are out of flow** (inline `position: absolute`, plus the existing `size-0` and
  `pointer-events-none`). An absolutely positioned child is not a flex item, so it adds no gap and no
  `justify-content` slot. Edit-mode layout at rest is identical to preview for any `gap` and any
  `justify-content`.
- **Shown dividers stay in flow**, because they must sit between their siblings. They keep the
  2px thickness from ADR 0014 and get a negative margin of `(gap + thickness) / -2` on each side, so
  the two gaps and the bar's own thickness cancel and siblings do not move.
- The `Gap` setting is free text. `resolveMainAxisGap` reduces it to the gap along the parent's main
  axis (`column-gap` for a vertical divider, `row-gap` for a horizontal one) and treats values a
  browser would ignore (`0`, `normal`, unitless numbers, CSS-wide keywords, malformed input) as `0px`,
  so the `calc()` is always valid.
- Styles are computed in `getDividerLayoutStyle` and applied through React's `style` prop. Nothing
  sets styles imperatively on the element.

## Consequences

- Rows and columns pass their `gap` to each `Divider`.
- While a divider is shown, `justify-content: space-between | around` with naturally sized children
  can shift siblings slightly, because the bar is then a real flex item. This only happens while the
  pointer is near an edge. Removing it needs dividers that are not flex items of the parent, which
  is a larger change to the edit-mode tree.
- A percentage gap resolves against a different axis for horizontal dividers' margins than for
  `row-gap`, so it is approximate there.
- Jest (jsdom) discards `calc()` margins, so unit tests assert the margin strings on
  `getDividerLayoutStyle`, not on the DOM. Verify visually: compare
  `/try?template=farm-logistics-landing-page&mode=edit` with `&mode=preview`.
