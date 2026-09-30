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
| [`prompt-assist`](../features/prompt-assist/) | Chat that turns a prose request into a template, copy, and design edits |

Use [the glossary](./GLOSSARY.md) for the precise meaning of these terms.

## Shared libraries

Code with no domain knowledge lives in [`lib/`](../lib/) and can be used by any feature or route handler.

| Library | Responsibility |
| --- | --- |
| [`jev`](../lib/jev/) | Server-only client for TypeSafe's Jev decision model (Choice, Noul) |
| [`openai`](../lib/openai/) | Server-only client for OpenAI chat completions with schema-validated JSON replies |
| [`rate-limit.ts`](../lib/rate-limit.ts) | In-memory rate limiting and client identification |
| [`utils.ts`](../lib/utils.ts) | Small general helpers |

## Posture

- Prefer the app-state API and serializers over direct state mutation.
- Keep public feature-facing types deeply readonly.
- Backward compatibility is not a priority yet. Prefer clean refactors over shims.
- Placeholders are runtime tokens embedded in component strings and resolved before rendering.

## Prompt assist

The chat on `/try` turns "describe the page you want" into a proposal the person reviews before it is applied in one history entry. Nothing in it hard-codes templates, tags, or settings; each step reads them from the module that owns them.

1. **Match.** The catalog comes from [`templates`](../features/templates/) (`describeTemplateCatalog`) and is given to Jev as state for one Choice question, with a no-match option. Jev's probabilities decide; a close call or no-match makes OpenAI ask one clarifying question (at most two), and OpenAI is the fallback judge when Jev is unavailable.
2. **Copy.** OpenAI fills the free-text slots the template declares in its own `dataMapping` (`listTemplateTextFields`), whatever they are named.
3. **Design loop.** The browser describes the page from the component registry (`describePage`), then loops: Jev answers a Noul question ("does the page satisfy the request?"); if not, OpenAI proposes edits to settings the registry exposes (`describeEditableSettings`). Every edit passes one validator (`filterDesignEdits`), on the server against the description and in the browser against the live registry, before it is applied. The loop stops when Jev is satisfied, when a step changes nothing, or after a fixed number of steps.
4. **Apply.** The proposal is composed from the template, copy, and edits, and dispatched through `createApplyTemplateActions`.

The design loop runs step by step from the browser because the component registry loads React components and cannot be bundled into a route handler. The server sees only the request and the page description.

The chat is opt-in per page load: it renders only when the builder is opened with `?prompt-assist=1` (`availability.ts`). That gates visibility only; the `/api/prompt-assist` routes remain reachable and are protected by the provider keys, validation and rate limits. Both providers are optional; see [`.env.example`](../.env.example). [`lib/jev`](../lib/jev/) and [`lib/openai`](../lib/openai/) read secrets, import `server-only`, and are reusable by any server code. Route handlers use `prompt-assist/server.ts`, never the client barrel.

## Before you change things

Read this file, [the conventions](./CONVENTIONS.md), [the glossary](./GLOSSARY.md), and any relevant [ADR](./adr/) before changing cross-cutting component behavior. [The agent workflow](./AGENT-WORKFLOW.md) covers how to scope and finish a task.
