# Page templates and component templates

**Status:** Accepted.

The product historically used the bare word "templates" for whole-page starting points
(`PageTemplateDefinition`, `pageTemplateRegistry`, the header catalog). Component templates
(pre-built subtrees that replace a selected design component) are arriving under the same
product area (#512). Leaving the bare word in folders, identifiers, and UI text would make
the two features collide in names, search, and mental model.

## Decision

- **Vocabulary.** Whole-page starting points are **page templates**. Pre-built subtrees that
  replace a selected design component are **component templates**. The unqualified word
  "template" is not used for either feature in new code, UI text, or docs.
- **Separate id namespaces.** Page-template ids and component-template ids live in separate
  registries and must not be assumed unique across both. Routes, deep links, and storage keys
  that name one kind must qualify it (`page-template`, `component-template`).
- **Naming rule.** Identifiers, folders, files, test paths, skills, and UI strings for the
  existing feature take a `PageTemplate` / `pageTemplate` / `page-template` form. Component
  templates use `ComponentTemplate` / `componentTemplate` / `component-template`.
- **External-name table (from #512).** Code and docs use the table below. Sibling issues own
  migration of contracts that leave the process (URLs, public assets, analytics, storage,
  schema literals).

| Concern | Page templates | Component templates |
| --- | --- | --- |
| Feature folder | `client/features/page-templates/` | `client/features/component-templates/` (future) |
| Definition type | `PageTemplateDefinition` | `ComponentTemplateDefinition` |
| Registry | `pageTemplateRegistry` | `componentTemplateRegistry` |
| Catalog UI | Page Templates (header) | Component Templates (settings tab) |
| Deep-link / route qualifier | `page-template` / `/preview/page-templates/` | `component-template` / `/preview/component-templates/` |

## Consequences

- A mapped rename of the existing feature is required before component templates land in the
  same surface. That rename is issue #514 (this ADR's companion implementation).
- Historical ADR bodies are not rewritten. New work uses the vocabulary above.
- Schema literals (`livepage-template`), storage keys, analytics events, and public asset
  paths are owned by the sibling issues in #512 so each change has its own compatibility
  tests.
