# LivePage

LivePage is a visual page builder. You compose a page from design components in an in-browser editor, connect components to data sources, and export the result as JSON, shortcode, or a standalone HTML file.

> **Status:** early development (`0.1.0`). Formats and APIs can change without notice.

## Features

- **Visual editor.** Add, replace, and configure design components such as headers, rows, columns, images, stats, callouts, charts, metric cards, and data tables. Includes undo/redo history and a command palette.
- **Data sources.** Bind components to REST APIs, GraphQL, JSON feeds, RSS feeds, CSV, or generated data through placeholders.
- **Templates.** Start from bundled templates: SaaS landing page, agency homepage, personal portfolio, CV/resume, blog article, event page, link-in-bio, contact/about, and patient health dashboard.
- **Page assistant (optional).** Describe the page you want in plain language; a chat picks a template, drafts its text, and tunes its design settings. Off unless enabled with `NEXT_PUBLIC_PROMPT_ASSIST_ENABLED=1`, and even then hidden unless the page is opened with `?prompt-assist=1`; see [Optional: page assistant](#optional-page-assistant).
- **Import and export.** Save and load pages as JSON or shortcode, or export a standalone HTML page.

## Getting started

You need Node.js 18.18 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page, or go straight to the builder at [http://localhost:3000/try](http://localhost:3000/try).

### Optional: page assistant

The feature is off by default. Set `NEXT_PUBLIC_PROMPT_ASSIST_ENABLED=1` and rebuild (the value is inlined at build time) to turn it on; then the chat bubble (bottom-right of `/try`) appears only when you open the builder with `?prompt-assist=1` (for example `/try?prompt-assist=1`). With the flag off, the `/api/prompt-assist` routes answer 404. It uses [TypeSafe's Jev](https://docs.typesafe.ai) and/or OpenAI. Copy [`.env.example`](./.env.example) to `.env.local` and set `TYPESAFE_API_KEY` and/or `OPENAI_API_KEY`; with neither, the chat lets you pick a template by hand and everything else works as before. Keys stay on the server, and the request text is sent to whichever provider you configure. How it works is described in [`docs/CONTEXT.md`](./docs/CONTEXT.md#prompt-assist).

## Development

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint through `next lint` |
| `npm test` | Run the Jest suite |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run test:coverage` | Run Jest with coverage |
| `npm run build:html-runtime` | Rebuild the browser runtime used by HTML exports |
| `npm run test:html-browser` | Run the standalone HTML artifact regression test in Chromium |

The dev, build, start, and test commands rebuild the HTML export runtime automatically. It is generated into `client/features/serializers/html/generated/`, which is git-ignored.

The standalone HTML browser test serves the exact serializer output over loopback,
then runs it in headless Chromium. It fulfills the export's pinned React imports
from the locally installed React packages and blocks other external requests. To
install the browser locally, run `npx playwright install chromium` once after
`npm install`; then run `npm run test:html-browser`. Its fixed fixture uses
components supported by the current export runtime; it does not assert general
editor-preview parity.

The app is built with Next.js (App Router), React 19, TypeScript, Tailwind CSS, Radix UI, and Zod. Tests use Jest and Testing Library.

## Project layout

Application code is organized by runtime: browser features and UI live in [`client/`](./client/), backend features and integrations in [`server/`](./server/), and runtime-neutral models and contracts in [`shared/`](./shared/). Each runtime groups domain code in its own `features/` subfolder. The Next.js route tree stays in [`app/`](./app/); page files import client features, while API route files are thin adapters to server features. UI primitives live in [`client/components/ui/`](./client/components/ui/). [`docs/CONTEXT.md`](./docs/CONTEXT.md) has the module map and import-boundary rule.

## HTML exports

An HTML export is a single file that opens directly in a modern browser, with no LivePage server needed. Keep these limits in mind:

- The file loads pinned React and ReactDOM builds from [esm.sh](https://esm.sh), so the browser needs network access when it opens the file.
- The export runtime supports the generated-data and REST API data sources. REST endpoints must allow the page's origin through CORS.
- Image and other asset URLs stay as references. They are not embedded.

## Bundled templates

Templates live in [`shared/features/templates/definitions/`](./shared/features/templates/definitions/). Each one is versioned (`schema` and `version`), keeps catalog metadata separate from its `content.pages` payload, and stores the page as the same `AppNode` tree the editor uses.

To add a template:

1. Create a definition in `shared/features/templates/definitions/` using only supported design-component tags.
2. Keep catalog metadata (`name`, `description`, `category`, `tags`, `thumbnail`) outside the page payload.
3. Validate it with `pageTemplateDefinitionSchema` and register it in `shared/features/templates/registry.ts`.
4. If the template is meant for imported profile data, add `dataMapping` entries that point to the target component ids and fields.

The CV/resume templates include LinkedIn-shaped mapping notes in their `dataMapping` blocks.

## Documentation

- [Project context](./docs/CONTEXT.md) and [architecture decisions](./docs/adr/)
- [Code conventions](./docs/CONVENTIONS.md)
- [Glossary](./docs/GLOSSARY.md)
- [AGENTS.md](./AGENTS.md) and the [agent workflow](./docs/AGENT-WORKFLOW.md) for coding agents

## Security and conduct

Report vulnerabilities privately as described in [SECURITY.md](./SECURITY.md). Participation in this project is governed by the [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

[MIT](./LICENSE)
