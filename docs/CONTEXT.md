# LivePage project context

LivePage is a page builder. The document being edited is a single **app state**, a tree of readonly **app nodes**, and each domain concern lives in its own folder under [`features/`](../features/).

## Module map

| Module | Responsibility |
| --- | --- |
| [`app-state`](../features/app-state/) | Command/selector API over the app state |
| [`serializers`](../features/serializers/) | JSON, shortcode, and standalone HTML import/export |
| [`shortcode-parser`](../features/shortcode-parser/) | Parser used by the shortcode serializer |
| [`design-components`](../features/design-components/) | Component definitions (metadata, settings, renderers) |
| [`design-component-runtime`](../features/design-component-runtime/) | Registry, instance creation, and the shared preview renderer |
| [`data-sources`](../features/data-sources/) | Data-source definitions and resolution |
| [`placeholders`](../features/placeholders/) | Runtime tokens resolved inside component strings |
| [`page-builder`](../features/page-builder/) | Editor UI, toolbar, and editor controls |
| [`templates`](../features/templates/) | Bundled page templates and the template catalog |
| [`command-palette`](../features/command-palette/) | Command palette for the builder |

Use [the glossary](./GLOSSARY.md) for the precise meaning of these terms.

## Posture

- Prefer the app-state API and serializers over direct state mutation.
- Keep public feature-facing types deeply readonly.
- Backward compatibility is not a priority yet. Prefer clean refactors over shims.
- Placeholders are runtime tokens embedded in component strings and resolved before rendering.

## Before you change things

Read this file, [the conventions](./CONVENTIONS.md), [the glossary](./GLOSSARY.md), and any relevant [ADR](./adr/) before changing cross-cutting component behavior. [The agent workflow](./AGENT-WORKFLOW.md) covers how to scope and finish a task.
