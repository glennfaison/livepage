# LivePage project context

LivePage is a page builder. The document being edited is a single **app state**, a tree of readonly **app nodes**. Source code is organized first by runtime (`client/`, `server/`, and `shared/`), then by domain under each runtime's `features/` folder.

## Runtime and module map

| Area | Responsibility |
| --- | --- |
| [`app/`](../app/) | Next.js App Router pages and thin API route adapters; keep these in Next's required route tree |
| [`client/features/app-state/`](../client/features/app-state/) | State transitions, selectors, tree operations, history, and React hook |
| [`client/features/page-builder/`](../client/features/page-builder/) | Visual studio shell: canvas orchestrator, toolbar, history, and operation hooks |
| [`client/features/design-components/`](../client/features/design-components/) | Component definitions, preview/edit renderers, settings catalog, and editor controls |
| [`client/features/data-sources/`](../client/features/data-sources/) | Browser data-source registry, decorators, and browser data loader |
| [`client/features/placeholders/`](../client/features/placeholders/) | Browser runtime tokens resolved inside component strings |
| [`client/features/serializers/`](../client/features/serializers/) | JSON, shortcode, and standalone HTML import/export operations |
| [`client/features/serializers/schema.ts`](../client/features/serializers/schema.ts) | Runtime validation for serialized app-node trees |
| [`client/features/shortcode-parser/`](../client/features/shortcode-parser/) | Parser used by the browser-side shortcode serializer |
| [`client/features/templates/`](../client/features/templates/) | Template definitions, catalog, schema, data mapping, and picker UI |
| [`client/features/command-palette/`](../client/features/command-palette/) | Command palette for the builder |
| [`client/features/prompt-assist/`](../client/features/prompt-assist/) | Browser chat, page description, and design refinement loop |
| [`server/features/prompt-assist/`](../server/features/prompt-assist/) | Provider orchestration and prompt-assist request handling |
| [`shared/features/prompt-assist/contract/`](../shared/features/prompt-assist/contract/) | Runtime-neutral prompt-assist schemas, flag, and edit validation |
| [`client/features/types.ts`](../client/features/types.ts) | Client-owned app-state and feature-facing types |
| [`client/components/`](../client/components/) | Browser providers, theme controls, and UI primitives |
| [`server/services/`](../server/services/) | Server-only provider clients such as Jev and OpenAI |
| [`server/lib/`](../server/lib/) | Server-only infrastructure such as rate limiting |
| [`client/lib/`](../client/lib/) | Browser/UI utilities such as ID generation and class-name merging |

```text
app/                         # Next.js pages and API route adapters
client/
  components/
  features/
  lib/
server/
  features/
  lib/
  services/
shared/
  features/
```

## Dependency rule

The folder layout expresses the import boundary:

```text
client ──► shared
server ──► shared
app page ──► client
app API route ──► server
```

Client and server code must not import each other. Code used by both belongs in `shared/`; keep it free of React components, browser APIs, secrets, and server-only dependencies. Server modules that access secrets or otherwise cannot enter a browser bundle import `server-only`. API route files remain in `app/api/**/route.ts` because Next.js discovers routes from that location; route implementations belong in `server/`.

Keep `shared/` deliberately small: it contains only the prompt-assist contract consumed by both runtimes. App-node types and validation, template definitions/catalog, component tags, app-state operations, placeholders, shortcode parsing, data-source constants, UI, and utilities are client-owned.

## Prompt assist

The chat on `/try` turns "describe the page you want" into a proposal the person reviews before it is applied in one history entry. Nothing in it hard-codes templates, tags, or settings; each step reads them from the module that owns them.

1. **Match.** The browser sends a bounded catalog summary from `client/features/templates/` to the server. The server gives it to Jev as state for one Choice question, with a no-match option. Jev's probabilities decide; a close call or no-match makes OpenAI ask one clarifying question (at most two), and OpenAI is the fallback judge when Jev is unavailable.
2. **Copy.** The browser sends the selected template's bounded metadata and writable text-field descriptors (`listTemplateTextFields`). OpenAI fills those slots, whatever they are named. The server validates the payload and does not import the template feature.
3. **Design loop.** The browser describes the page from the component registry (`describePage`), then loops: Jev answers a Noul question ("does the page satisfy the request?"); if not, OpenAI proposes edits to settings the registry exposes (`describeEditableSettings`). Every edit passes one validator (`filterDesignEdits`), on the server against the description and in the browser against the live registry, before it is applied. The loop stops when Jev is satisfied, when a step changes nothing, or after a fixed number of steps.
4. **Apply.** The proposal is composed from the template, copy, and edits, and dispatched through `createApplyTemplateActions`.

The design loop runs step by step from the browser because the component registry loads React components and cannot be bundled into a route handler. The server sees only the request, bounded catalog/field metadata, and page description.

The feature is off unless `NEXT_PUBLIC_PROMPT_ASSIST_ENABLED=1` (`shared/features/prompt-assist/contract/feature-flag.ts`). One flag serves both sides: the `/api/prompt-assist` routes answer 404 when it is off, and the chat never renders, so the two cannot disagree. When on, the chat also appears only on pages opened with `?prompt-assist=1` (`client/features/prompt-assist/availability.ts`). The flag is inlined at build time, so changing it needs a rebuild. Once enabled, routes are protected by provider keys, validation, and rate limits. Both providers are optional; see [`.env.example`](../.env.example). [`server/services/jev/`](../server/services/jev/) and [`server/services/openai/`](../server/services/openai/) read secrets and import `server-only`. Route handlers use the server feature entry point, never the client barrel.

## Before you change things

Read [the conventions](./CONVENTIONS.md), [the glossary](./GLOSSARY.md), and any relevant [ADR](./adr/) before changing cross-cutting component behavior. [The agent workflow](./AGENT-WORKFLOW.md) covers how to scope and finish a task.
