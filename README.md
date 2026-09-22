This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## HTML exports

HTML exports are single files that can be opened directly in a modern evergreen
browser. They load the pinned React runtime from esm.sh, so the browser needs
network access when the file is opened. REST data sources also need to allow
requests from the browser through CORS. Image and other asset URLs are kept as
references rather than embedded in the export.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Bundled templates

Bundled page templates live in [`features/templates/`](./features/templates/). Each template definition is versioned (`schema` + `version`), keeps catalog metadata separate from the `content.pages` payload, and stores the editable page as the same `AppNode` tree used everywhere else in the editor.

To add another template:

1. Create a new definition in `features/templates/definitions/` using only supported design-component tags.
2. Keep catalog metadata (`name`, `description`, `category`, `tags`, `thumbnail`) outside the page payload.
3. Validate the definition through `pageTemplateDefinitionSchema` and register it in `features/templates/registry.ts`.
4. If the template is meant for imported profile data, add `dataMapping` entries that point to the target component ids/fields.

## LivePageAI

The builder's LivePageAI integration calls TypeSafe Jev from the server through
`/api/livepage-ai`. Configure the provider credential in the server environment
only:

```bash
TYPESAFE_API_KEY=your-typesafe-key
```

Do not use a `NEXT_PUBLIC_` variable or commit the credential. LivePageAI keeps
chat memory in the current browser session, uses an opaque session identifier
only for request correlation, and accepts only bounded page-building actions.
Responses also include a bounded, validated `progress` list describing scope
evaluation and proposed mutations. A mutation names the exact design-component
`componentTag`, its `parentId` or `componentId` (or `page root` location),
`content`/`value`, and a terminal `signal` (`completed` or
`needs_clarification`). This makes each response independently actionable and
safe to retry: only the closed action set crosses the app-state API boundary,
and stale history indices are rejected by the reducer. Provider credentials
are never included in transcripts or progress events.

For broad build requests, the chat uses a resumable workflow: it evaluates
scope, presents a shared understanding for confirmation, announces one next
component and its target at a time, applies it through the reducer, and sends a
fresh tree/history snapshot for verification before continuing. The client
also records a bounded DOM observation (existence, rendering, and geometry);
failed verification can produce a repair decision instead of silently moving
on. The workflow is ephemeral to the current chat and stops after a bounded
number of component decisions.

The bundled CV / resume templates include LinkedIn-shaped mapping notes in their `dataMapping` blocks. The engineer variants demonstrate dark and light minimalist layouts, shared text appearance settings, semantic links, and same-page navigation through component `id` attributes.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
