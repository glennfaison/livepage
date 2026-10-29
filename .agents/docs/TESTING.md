# Testing

How tests are categorized, where they live, how to run them, and how CI orders them.

## Categories

| Category | Location | Runner | Command | Runs on every PR |
| --- | --- | --- | --- | --- |
| **Smoke (unit)** | `__tests__/smoke/` | Jest | `npm run test:smoke:unit` | Yes, first |
| **Smoke (UI)** | `__tests__/browser/smoke/` | Playwright | `npm run test:smoke:ui` | Yes, first |
| **Unit** | `__tests__/unit/`, colocated `client/**/*.test.ts(x)` | Jest | `npm run test:unit` | Yes, after smoke |
| **Component** | `__tests__/components/`, `__tests__/integration/` | Jest + Testing Library | `npm run test:component` | Yes, after smoke |
| **Playwright UI** | `__tests__/browser/` (includes `smoke/`) | Playwright | `npm run test:ui` | Yes, after smoke, unit, component |

`npm run test:smoke` runs both smoke suites. `npm test` still runs every Jest test.
Category membership is decided by path, not tags. `npm run check:test-categories` fails
if a Jest file sits outside the paths above, because the per-category CI jobs would never run it.

## What belongs in smoke

Smoke answers "is the app fundamentally alive?" in a few minutes. A smoke test must be:

- **Critical path only:** app and main routes load without fatal errors; a template opens and
  renders visible content; the data-source path (registry, encode/decode, load, failure) works.
- **Fast and deterministic:** no real network, no screenshots or baselines, no sleeps.
- **Small:** if a test needs more than a few assertions of setup, it is a unit, component, or UI test.

Not smoke: per-component behaviour, edge cases, serializer detail, visual regression,
per-template layout comparisons, exhaustive template quality rules. Put those in the other
categories. Do not move existing tests into smoke to make them "run earlier".

## CI order (`.github/workflows/ci.yml`)

`gitflow checks` -> `smoke` -> `unit` -> `component` -> `ui` (shortest to longest).
`unit` and `component` need `smoke`; `ui` needs all three. A smoke failure skips every longer job.

- Pull requests, pushes to `develop` and `main`, and the nightly schedule (03:00 UTC) run the full chain.
- Pushes to other branches run only the branch-name check; the pull request runs the rest.
- `workflow_dispatch` runs the full chain on demand.
- The `smoke` job also runs `npm run lint` and `npm run check:hooks`, so lint is enforced even when a contributor's local hooks were skipped.
- Target: the PR smoke path stays under about 5 minutes. If it grows past that, trim smoke, do not raise the budget.

## Local gates

The git hooks (enabled by `npm install`, see [CONTRIBUTING.md](../../CONTRIBUTING.md#git-hooks)) run the cheapest checks locally, in the same order as CI:

- `pre-commit`: ESLint on the staged JS/TS files only.
- `pre-push`: branch-name check, then `npm run test:smoke`. The push never waits on the unit, component, or Playwright UI suites; CI runs those.
