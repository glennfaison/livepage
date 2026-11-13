# Component template model

**Status:** Accepted

## Context

Prompt assist and future features need to handle both page templates and component templates. Page templates
(`livepage-template`) require a LinkedIn `dataMapping` and a full `pages` tree, which is overkill for a template
that replaces *one component*. There was no model for a single-component template, so the page-template schema
was being stretched to serve two kinds of ids that can collide.

## Decision

- **New feature:** `client/features/component-templates/` holds the component-template model, separate from
  `client/features/templates/` (page templates).
- **Schema** (`schema.ts`): `livepage-component-template`, versioned, with `id`, `metadata` (name, description,
  category, tags, thumbnail), and `content.root` — a single `AppNode` validated with `appNodeTreeSchema`. No
  `dataMapping`. Versioning and migration mirror the page-template schema.
- **Registry** (`registry.ts`): validated at module load, like the page registry. Exposes
  `componentTemplateRegistry`, `getComponentTemplateById`, `describeComponentTemplateCatalog`, and
  `ComponentTemplateSummary`.
- **Definitions** (`definitions/`): one placeholder definition (`callout-component`) to start.
- **Assets:** `public/component-template-thumbnails/` for thumbnails, `public/component-template-art/` for hero art.
- **Quality test** (`__tests__/unit/component-templates/template-quality.test.ts`): unique ids inside a template
  and across the registry; root tag allowed as a child of some registered component; thumbnail exists.
- **Shared helpers** (`client/features/templates/template-helpers.ts`): `node()` and `text()` extracted from
  per-definition duplicates so both page and component templates use the same module.
- **Nothing here accepts or emits an unqualified template id.** The schema literal `livepage-component-template`
  qualifies the kind at the schema level.

## Consequences

- Page-template and component-template schemas are now distinct, so template ids can never collide between kinds.
- Component templates are simpler (single root node, no data mapping) and cannot carry LinkedIn profile data.
- Future prompt-assist matching will reference `pageTemplateId` for page templates and `componentTemplateId`
  (or a `{kind, id}` union) for component templates.
