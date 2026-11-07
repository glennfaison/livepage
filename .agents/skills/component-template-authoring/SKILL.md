---
name: component-template-authoring
description: Create or modify a LivePage Component template (a ComponentTemplateDefinition in client/features/component-templates/). Use when adding a component template, redesigning one, swapping its images, or fixing its structure. Covers the file structure, structure gotchas, assets, extending the Design Components when a design needs it, the review loop, and the PR every Component template change ships in.
---

# Component template authoring

This is the Component template-specific form of the [agent orchestration loop](../agent-orchestration/SKILL.md): the review sub-agent applies its own fixes, and the loop ends with a PR.

Component templates are typed data, not components. Each lives in
`client/features/component-templates/<name>.ts` and is registered in
`client/features/component-templates/registry.ts`. Read
[the conventions](../../../.agents/docs/CONVENTIONS.md) and
[the glossary](../../../.agents/docs/GLOSSARY.md) first, and use
`client/features/component-templates/schema.ts` as the source of truth.

## The loop

1. **Read** the component template and one finished sibling (for example
   `hero-section.ts` or `feature-card.ts`).
2. **Branch.** Work on a branch named `feature/component-templates-<template-id>` (e.g.
   `feature/component-templates-hero-section`). Never commit Component template work
   straight to `main`.
3. **Edit** the definition and its assets (rules below). If the design needs
   something the Design Components cannot express, extend them (next section).
4. **Static checks:** `npx tsc --noEmit`, `npx eslint <changed files>`, and
   `npm test -- --runInBand __tests__/unit/component-templates`. The component
   template quality test is the first line of defence: it fails on placeholder
   images, missing assets, uncentered `max-w` columns, and fixed-size images in stretched rows.
5. **Review.** Hand the component template to a review sub-agent (see
   `template-design-review`). It renders the component template, finds defects, and
   fixes them itself, so the main agent only receives a summary. Do not review
   your own edits in the main context.
6. **Verify the review's changes** with the static checks again, and skim the
   diff it reports. Loop to step 5 only if its verdict is not **pass**.
7. **Submit a PR** (below).

## Extending the Design Components

The Component template is the goal; the component set is a means. If a design needs a
component, or a setting (attribute) on an existing one, that does not exist,
add it instead of working around it with fragile `custom-classes`.

- Components are registered through metadata in
  `client/features/design-components/definitions/`. Register through that
  metadata and `registry.ts`, never with tag-specific branches in consumers.
- A new setting goes in the component's settings fields and
  `settings-catalog.ts`, with a default that leaves every existing component
  template and saved page rendering unchanged.
- Implement both the edit-mode and preview-mode rendering; the preview renderer
  is shared with HTML export (see
  `.agents/docs/adr/0002-shared-preview-renderer.md`).
- Respect the module boundaries in `.agents/docs/CONVENTIONS.md`
  (`design-components` does not import from `page-builder`).
- Add or extend a unit test for the new behavior, and update
  `.agents/docs/GLOSSARY.md` if you introduce a domain term.
- Keep component changes in their own commit, ahead of the Component template commit
  that uses them, and call them out in the PR description.

## Structure rules

- Use the file-local `node(tag, id, attributes, children)` and `text(...)`
  helpers; copy them from a sibling.
- Every node `id` is unique and stable.
- Register new component templates in `registry.ts` and fill in `metadata` (name,
  description, category, tags).
- Attribute values are strings. Spacing is set with attributes such as
  `padding-top`, `gap`, and `margin-left`, not only with Tailwind classes.

## Layout gotchas (each one caused a real defect)

This is the single home for these; the review skill points here.

- **Inline attributes beat Tailwind classes.** `padding-*` and `margin-*`
  attributes become inline styles, so the default padding of 0 overrides a
  `p-10` in `custom-classes`. Set padding by attribute.
- **The page is 90% of the viewport wide.** A `max-w-*` column with `mx-auto`
  sits flush left because the inline margin wins. Set `"margin-left": "auto"`
  and `"margin-right": "auto"`.
- **Row children stretch and flex.** Rows give children
  `flex-1 basis-0 min-w-0 self-stretch` unless `"child-sizing": "natural"`.
  That stretched fixed-size avatars into pills. Use `natural` for rows of
  avatars, icons, and label/action pairs. `natural` still applies
  `self-stretch`, so add `"custom-classes": "[&>*]:!self-center"` to center
  children vertically.
- **A `flex-wrap` class does not make a row wrap.** Set `"wrap": "wrap"` on the
  row instead. A flex item only moves to a new line when its hypothetical main
  size exceeds the space left, and that size comes from the basis. Equal sizing
  uses `basis-0`, so it reports a hypothetical size of zero and the row can never
  break, whatever `flex-wrap` says in `custom-classes`. With `"wrap": "wrap"`
  the row uses `basis-auto`, so children size to their content and the line
  breaks when they no longer fit; `flex-1` still grows them to fill each line.
  Do not add `flex-wrap`, `md:flex-nowrap`, or `lg:flex-nowrap` to a row's
  `custom-classes` — they are redundant at best and inert at worst.
- **Fixed-size images in flex rows need `shrink-0`** (a 96px avatar rendered
  64px wide).
- **Equal-height cards:** stretch the wrapping columns and give the inner
  component `flex-1`. Sidebars that should not stretch need `!self-start`.
- **Right-aligning an item in a row:** `ml-auto` on that child, with
  `child-sizing: natural` on the row.
- Give multi-column rows a `gap` of at least `1.5rem` when columns carry text.

If you hit a new class of defect, add it here and, where it can be checked from
the data alone, add a rule to `__tests__/unit/component-templates/template-quality.test.ts`.

## Assets

- Never ship `/placeholder-img.svg`.
- Portraits: `public/avatars/<first-last>.svg`, 200x200 viewBox with a
  background rect, torso, neck, head, hair, eyes, and smile. Vary skin, hair,
  and background per person, and reuse a person's file wherever they reappear.
- Illustrations and covers: `public/template-art/<template>-<subject>.svg`.
  Self-contained SVG (no external fonts or images), matching the slot's aspect
  ratio, using the template's accent colour.
- Set `fallbackSrc` to the asset and leave `src` empty, as siblings do. Write
  specific `alt` text.

## Content

- Fictional people, companies, and numbers only; `example.com` addresses.
- Complete content: no lorem ipsum, no empty sections.
- Keep names, headlines, and descriptions consistent.

## Known leftovers

The allowlist at the top of
`__tests__/unit/component-templates/template-quality.test.ts` lists component
templates that still break a rule. When you redesign one, remove it from the
allowlist; the test fails if you forget. Other open design items live in the PR
descriptions of the redesign work; check recent merged Component template PRs before
starting.

## Several component templates at once

Component templates are independent, so run one per sub-agent or session, each on its
own branch and in its own worktree (they share `registry.ts` and `public/`, so
parallel edits on one branch will conflict). Give each the same brief: component
template id, the goal, and "follow `component-template-authoring`, including the PR".
Brief them completely up front instead of a message per step.

## The PR

Every Component template change ships in a PR, one Component template per PR unless
the change is a shared component.

- Use the repository PR template (`.github/pull_request_template.md`) and keep
  its headings.
- Testing section: the exact commands run and their results, the review
  sub-agent's verdict, and the viewport sizes it checked.
- Summarize what changed visually, list any new Design Components or settings,
  and list defects deliberately left open.
- Save the final preview screenshots (desktop and about 390px wide) to the
  session `files/` folder and mention them; attach them to the PR if you can.
- Commits end with the `Co-authored-by: Copilot` trailer.

## Definition of done

- Static checks pass and the component template is off the quality allowlist.
- The review sub-agent's final verdict is **pass**.
- No placeholder images remain.
- A PR is open with the component template filled in.
