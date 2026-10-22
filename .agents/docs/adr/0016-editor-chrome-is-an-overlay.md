# Editor chrome is an overlay, not a wrapper box

**Status:** Accepted. Follows [ADR 0015](./0015-dividers-are-layout-neutral.md).

Issue #431: edit mode and preview lay a page out differently. ADR 0015 removed the drift caused by
insertion dividers. The remaining drift comes from `withEditorControls`, which wraps every
component in `<div class="relative block">`. That wrapper, not the component, becomes the flex or
grid item of its parent, but the component's own sizing classes (`w-full`, `flex-1`, `max-w-md`,
...) stay on the inner element and resolve against a shrink-to-fit box. Measured on `develop`
(headless Chromium, desktop):

- `link-in-bio-page`: `bio-links-list` is 400px wide in preview and 191px in edit.
- `farm-logistics-landing-page`: the services grid collapses to one narrow column; only 14 of 91
  matched elements are within 1px of preview.

A throwaway experiment that made the wrapper `display: contents` took the farm page to 89 of 91
elements within 1px, but it removed the box that the selection outline and the toolbar were
anchored to.

## Decision

- In edit mode the wrapper is `display: contents`. It has no box and takes no part in layout, so
  the component's own element is the flex or grid item exactly as in preview. The wrapper still
  carries the click and hover handlers (events bubble through it) and the accessibility
  attributes.
- The hover outline, the selection outline and the toolbar are drawn in an overlay: a portal to
  `document.body` whose position is read from the component's own element
  (`getBoundingClientRect` plus the page scroll offset), not from the wrapper. The outline copies
  the element's computed `border-radius`. The overlay is `pointer-events: none` except for the
  toolbar.
- Handlers that need the component's rectangle (insertion divider visibility) receive it from the
  component's element, because `getBoundingClientRect()` of a `display: contents` element is empty.
- `data-component-id`, `data-selected` and `aria-selected` stay on the wrapper element.
- Direct-child utilities use a `kids:` variant (`@custom-variant kids (& > *, & > [data-component-id] > *)`
  in `app/globals.css`) instead of `[&>*]:`. A child combinator would otherwise match the wrapper,
  which has no box, and skip the component inside it. Measured on mobile: `farm-hero` used
  `[&>*]:!flex-none`, so in edit mode its columns kept `flex: 1 1 0` and collapsed to 50px (page
  7,216px tall in edit vs 10,211px in preview). In preview and exported HTML there is no wrapper,
  so the second selector is inert. A unit test keeps templates on the variant.

## Consequences

- Edit-mode layout no longer depends on the wrapper, so parity with preview is limited only by
  intentional edit-only content (for example the "Add Row" drop zone).
- The overlay position is synchronised with the element on every animation frame while a component
  is hovered or selected, so it follows layout changes that no scroll or resize event reports.
- Selectors that depend on sibling or child position other than `> *` (for example `[&>p:first-child]`
  or `:last-child`) still cannot see through the wrapper. Only a wrapper-free DOM would remove that
  limit; it needs every component root to receive the editor handlers, which is a larger change.
- Components must render a single root element that carries the `id` from their attributes; the
  overlay measures that element.
