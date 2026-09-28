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

The bundled CV / resume templates include LinkedIn-shaped mapping notes in their `dataMapping` blocks. The engineer variants demonstrate dark and light minimalist layouts, shared text appearance settings, semantic links, and same-page navigation through component `id` attributes.

## Prompt assist chat

The `/try` editor has a minimizable chatbox (bottom-right, closed by default) where you can describe the page you want in plain language — e.g. "a dark, minimal résumé site for a backend engineer named Priya." It's implemented in [`features/prompt-assist/`](./features/prompt-assist/):

1. **Extract** — `extract-brief.ts` deterministically pulls tone/color hints and a candidate name/headline out of the prompt. No network call, in the spirit of [ector](https://github.com/Sanix-Darker/ector): fast, offline, dictionary-based extraction instead of an AI call for everything.
2. **Select** — `select-template.ts` ranks the bundled templates by keyword overlap with each template's own metadata (category, name, description, tags), bridged by a small synonym dictionary. If one template clearly wins, that's the match.
3. **Disambiguate (optional)** — when the top candidates are close, `jev-decision.ts` asks [TypeSafe's Jev](https://docs.typesafe.ai) a single Choice question over the shortlist. Jev returns a typed answer with a probability, not generated text, so it's used only for this one narrow judgment call — not for drafting copy. Without a `TYPESAFE_API_KEY`, this step is skipped and the top deterministic candidate is used instead.
4. **Draft copy** — `copy-draft.ts` asks OpenAI (a small, low-cost model — `gpt-5-nano` by default) to fill in the template's `name` / `headline` / `summary` fields from the prompt. Without an `OPENAI_API_KEY`, the chat falls back to the prompt-derived name/headline with no summary.
5. **Apply** — the chat shows a preview card with editable fields (and a "Use … instead" chip for each alternate template); clicking "Apply to canvas" writes the values onto the template's existing `dataMapping.fields` targets (the same fields used for LinkedIn-profile import) and adds one history entry.

Both API keys are optional — see [`.env.example`](./.env.example). The two API routes are rate limited per client, and outbound TypeSafe/OpenAI calls share a per-minute budget (`PROMPT_ASSIST_RATE_LIMIT_PER_MINUTE`, `PROMPT_ASSIST_PROVIDER_BUDGET_PER_MINUTE`; `0` disables). Counters live in process memory, so on serverless hosts they are best-effort; set a spend cap on the provider accounts too. The feature is fully usable with neither configured. When a key is set, the prompt text is sent to that provider (TypeSafe for step 3, OpenAI for step 4). Route handlers under `app/api/prompt-assist/` import from [`features/prompt-assist/server.ts`](./features/prompt-assist/server.ts), never from the client barrel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
