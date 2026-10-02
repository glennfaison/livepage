---
name: template-design-review
description: Visually evaluate a LivePage Template in the browser in preview mode and report concrete design defects (alignment, spacing, images, centering, equal heights). Use after every template change, when asked to review or improve a template's design, or before opening a PR that touches template definitions.
---

# Template design review

The evaluation half of the loop in `template-authoring`. Judge the rendered
template in **preview mode**, never the code. Edit mode adds a toolbar gutter
and selection chrome that change the layout, so edit-mode screenshots are not
evidence.

## Setup

1. Start a dev server on a free port. Port 3000 may be held by a stale server
   serving old assets, so use `npx next dev -p 3001` and verify with `curl`
   that it responds.
2. Restart the server before reviewing if you changed anything other than
   template files.
3. Open `http://localhost:3001/try` in the browser tools. The tab must be
   **visible**. Hidden tabs make clicks time out and leave the page
   half-hydrated (ChunkLoadError). If that happens, ask the user to bring the
   tab forward, then navigate again.

## Rendering the template

Page state resets on reload, so apply the template each time:

1. After a reload, wait about 8-10s for hydration. The first attempt right
   after editing a definition often fails while Next recompiles, so reload and
   retry once before concluding something is broken.
2. Click **Templates**, then the button labelled `Apply <Name> template`, for
   example `button[aria-label="Apply Contact / About template"]`.
3. Click **Switch to Preview Mode**, then press Escape to close the popover.
4. Wait 2-3s, then take screenshots. Screenshots lag, so take a second one if
   the page still looks like the empty home page.

## What to check

Capture the page top to bottom (use `scrollIntoViewIfNeeded()` on each
section) and measure with `page.evaluate` instead of eyeballing where you can:

- **Images:** every `main img` has `naturalWidth > 0`, is not the grey
  placeholder, and renders at the intended size (avatars have equal width and
  height; compare `getBoundingClientRect()` with the template's
  `width`/`height`).
- **Alignment:** items in a row share a vertical centre; actions and dates sit
  where intended (right-aligned items touch the row's right edge).
- **Spacing:** text columns have visible gutters (at least 1.5rem); cards have
  inner padding on all sides; no text touches a container edge.
- **Equal heights:** sibling cards or stats have the same rendered height.
- **Centering:** max-width shells are centered in the 90%-wide page, with equal
  space left and right.
- **Sidebars:** sticky or sidebar columns do not stretch to the full height of
  the main column.
- **Hierarchy and polish:** one clear focal point, consistent radii, accent
  colour used on purpose, no orphaned or clipped text, no gaps larger than a
  section break.
- **Narrow width:** resize to about 390px and confirm rows wrap sensibly and
  nothing overflows horizontally.
- **Console:** no new errors apart from known dev noise.

## Reporting

Return a short list: each defect with the component ID, the measured or
observed evidence, and the likely cause from the gotchas in
`template-authoring`. End with an explicit verdict: **pass** (no open defects)
or **fail** (with the list). Do not edit files in this skill.

## Cleanup

Stop the dev server by its numeric PID (`lsof -ti :3001`, then `kill <pid>`).
