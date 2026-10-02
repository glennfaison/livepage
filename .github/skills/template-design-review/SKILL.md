---
name: template-design-review
description: Visually evaluate a LivePage Template in the browser in preview mode, then fix the design defects found (alignment, spacing, images, centering, equal heights). Run as a sub-agent after every template change, when asked to review or improve a template's design, or before opening a PR that touches template definitions.
---

# Template design review

The evaluation half of the loop in `template-authoring`. It is meant to run in
a **sub-agent with a fresh context**, so the author is not grading its own
work. The reviewer finds defects **and fixes them**, then reports a short
summary. That keeps the main agent's context small.

## Brief the reviewer with

- the template id and the design goal in one or two sentences;
- the branch to work on (do not switch branches or open a PR; the caller does);
- nothing else. Do not paste the author's reasoning into the brief.

## Setup

Run the app's dev server (restart it first if anything other than template
files changed), open it in the browser tools, and make sure the tab is visible;
hidden tabs time out and leave the page half-hydrated. Use whatever port is
free, and stop any server you started when you finish.

## Rendering

Open `/try?template=<template-id>&mode=preview`. That applies the template and
switches to preview mode deterministically. Wait for hydration before
measuring; the first load after an edit can fail while the app recompiles, so
reload once before suspecting a defect.

Judge preview mode only. Edit mode adds a toolbar gutter and selection chrome
that change the layout, so edit-mode screenshots are not evidence. Screenshots
can lag, so take a second one if the page looks empty.

## What to check

Scroll through every section and measure with the page evaluator instead of
eyeballing where you can. Images are lazy-loaded, so scroll each into view
before reading `naturalWidth`.

- **Images:** `naturalWidth > 0`, not a placeholder, rendered at the intended
  size (avatars have equal width and height).
- **Alignment:** items in a row share a vertical centre; right-aligned items
  touch the row's right edge.
- **Spacing:** text columns have gutters of at least 1.5rem; cards have inner
  padding on all sides; no text touches a container edge.
- **Equal heights:** sibling cards or stats render at the same height.
- **Centering:** max-width shells have equal space left and right.
- **Sidebars** do not stretch to the full height of the main column.
- **Hierarchy and polish:** one clear focal point, consistent radii, deliberate
  accent colour, no clipped or orphaned text, no gap larger than a section
  break.
- **Narrow width:** repeat the pass at about 390px wide. Rows should wrap
  sensibly, with no horizontal overflow
  (`document.documentElement.scrollWidth <= innerWidth`).
- **Exported HTML parity:** the page exists to look like the exported site.
  Export the HTML, open it as a file, and compare the same sections for
  differences from preview mode.
- **Console:** no new errors apart from known dev-server noise.

## Fixing

For each defect, find the cause (the gotchas in `template-authoring` explain
most of them), edit the definition or assets, and re-render to confirm. If the
only clean fix needs a Design Component or setting that does not exist, add it
following "Extending the Design Components" in `template-authoring`. Then run
the static checks (`npx tsc --noEmit`, `npx eslint <files>`,
`npm test -- --runInBand __tests__/unit/templates`). Repeat until no defects
remain or you are stuck on one for three attempts.

Do not commit or open a PR; leave your changes in the working tree.

## Report back

Keep it short:

- **Verdict:** pass, or fail with the remaining defects.
- **Changes made:** file list with one line each, including any new Design
  Component or setting.
- **Evidence:** the measurements behind the verdict, and the viewport sizes
  checked.
- **Screenshots:** the paths of the final desktop and narrow screenshots, saved
  to the session `files/` folder.
