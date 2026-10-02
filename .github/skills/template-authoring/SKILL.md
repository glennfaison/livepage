---
name: template-authoring
description: Create or modify a LivePage Template (a PageTemplateDefinition in client/features/templates/definitions). Use when adding a template, redesigning one, swapping its images, or fixing its layout. Covers the file structure, registration, layout gotchas, assets, and the loop that ends with the template-design-review skill.
---

# Template authoring

Templates are typed data, not components. Each lives in
`client/features/templates/definitions/<name>.ts` and is registered in
`client/features/templates/registry.ts`. Read
[the conventions](../../../docs/CONVENTIONS.md) and
[the glossary](../../../docs/GLOSSARY.md) first, and use
`client/features/templates/schema.ts` as the source of truth.

## The loop

1. **Read** the template and one finished sibling (for example
   `patient-health-dashboard.ts` or `link-in-bio-page.ts`) for conventions.
2. **Render before editing.** Run the `template-design-review` skill on the
   current state and write down the concrete defects. Do not guess from code.
3. **Edit** the definition and its assets (rules below).
4. **Static checks:** `npx tsc --noEmit`, `npx eslint <file>`, and
   `npm test -- --runInBand __tests__/unit/templates`.
5. **Render after editing** with `template-design-review`. Repeat steps 3-5
   until the review passes. A change that has not been seen in preview mode is
   not done.
6. **Commit** one template per commit, with the `Co-authored-by` trailer.

## Structure rules

- Use the file-local `node(tag, id, attributes, children)` and `text(...)`
  helpers; copy them from a sibling rather than inventing a new builder.
- Every node `id` is unique within the template and stable. `dataMapping`
  targets must reference existing component IDs (validated at registration by
  `parsePageTemplateDefinition`), so renaming an ID means updating its mapping.
- Register new templates in `registry.ts`. Fill in `metadata` (name,
  description, category, tags) because template matching and the catalog read
  them. Add or update tests only when behavior, not content, changes.
- Attribute values are strings. Spacing is set with attributes such as
  `padding-top`, `gap`, and `margin-left`, not only with Tailwind classes.

## Layout gotchas (each one caused a real defect)

- **Inline attributes beat Tailwind classes.** `padding-*` and `margin-*`
  attributes are emitted as inline styles, so the default padding of 0
  overrides a `p-10` in `custom-classes`. Set padding by attribute (a dark card
  with `p-10` rendered with its text touching the edge).
- **The page is 90% of the viewport wide.** A `max-w-*` column with `mx-auto`
  sits flush left because the inline margin wins. Set `"margin-left": "auto"`
  and `"margin-right": "auto"` on centered shells.
- **Row children stretch and flex.** Rows give children
  `flex-1 basis-0 min-w-0 self-stretch` unless `"child-sizing": "natural"`.
  That stretched fixed-size avatars into pills. Use `natural` for rows of
  avatars, icons, and label/action pairs. `natural` still applies
  `self-stretch`, so add `"custom-classes": "[&>*]:!self-center"` for vertical
  centering.
- **Fixed-size images in flex rows need `shrink-0`**, otherwise they narrow (a
  96px avatar rendered 64px wide).
- **Equal-height cards:** stretch the wrapping columns and give the inner
  component `flex-1`. Sidebars that should not stretch need `!self-start`.
- **Right-aligning an item in a row** (a Download link, a date): `ml-auto` on
  that child, with `child-sizing: natural` on the row.
- Give multi-column rows a `gap` of at least `1.5rem` when columns carry text.

## Assets

- Never ship `/placeholder-img.svg`. Check with
  `grep -rn placeholder-img client/features/templates/definitions`.
- Portraits: `public/avatars/<first-last>.svg`, 200x200 viewBox with a
  background rect, torso, neck, head, hair, eyes, and smile. Vary skin, hair,
  and background colour per person, and reuse a person's file wherever they
  reappear.
- Illustrations and covers: `public/template-art/<template>-<subject>.svg`.
  Keep them self-contained SVG (no external fonts or images), match the aspect
  ratio of the slot, and use the template's accent colour.
- Set the image `fallbackSrc` to the asset and leave `src` empty, as siblings
  do. Write specific `alt` text.

## Content

- Fictional people, companies, and numbers only. Use `example.com` addresses
  and reserved phone numbers.
- Content should feel complete: no lorem ipsum, no empty sections.
- Keep names, headlines, and `dataMapping` descriptions consistent so imported
  profile data (for example from LinkedIn) lands in the right nodes.

## Definition of done

- `tsc`, eslint on the file, and the template tests pass.
- `template-design-review` passes in preview mode with no open defects.
- No placeholder images remain in the template.
- The commit message names the template and the user-visible change.
