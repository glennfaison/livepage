# Observability

Production observability uses free tiers only:

- **PostHog** (product analytics, error tracking, session replay)
  - Free tier: ~1M events/month, 5k session recordings/month, 100k exceptions. Ingest stops at limits (no surprise billing).
  - Session replay masks all inputs and all text (`maskAllInputs: true`, `maskTextSelector: "*"`) so page-builder canvas content is never sent in clear.
  - No user accounts are stored; events are anonymous / identified_only.
- **Vercel Speed Insights** — real-user Core Web Vitals (free tier: 10k events / 30 days shared).
- **Vercel Web Analytics** — basic page views (Hobby free limits).

## What is tracked

- Uncaught client JS errors and React error-boundary exceptions
- Server / API route failures (via `instrumentation.ts` `onRequestError`)
- Feature usage events (initial set):
  - `template_applied` (templateId, optional source)
  - `command_palette_opened`
  - `data_source_test` (source type)
  - `export_initiated` (type)
- Page views and session recordings (masked)

## Privacy

Builder canvas content is treated as sensitive. Text and inputs are masked in session replay. No secrets or full page trees are sent.

## Kill switch

Set `NEXT_PUBLIC_OBSERVABILITY_ENABLED=0` (or omit PostHog keys) to disable. Tests and missing keys are no-ops.

Env vars are documented in `.env.example`. No secrets are committed.
