---
name: code-review
description: Review the current changes for correctness, regressions, architecture risk, and missing validation. Use for /code-review, pre-commit reviews, staged or branch diffs, and pull-request preparation.
---

# Code review

Perform a read-only, evidence-based review of the current changes. Do not edit
files, commit, or create issues unless the user explicitly asks after the
review.

## Review workflow

1. Establish the review scope before inspecting details:
   - Prefer the user's requested scope.
   - Otherwise review unstaged and staged changes, then compare the current
     branch with its merge base when branch intent is relevant.
   - Do not report unrelated pre-existing issues unless they are made worse by
     the changes.
2. Read `AGENTS.md`, the relevant `docs/` guidance, package scripts, and any
   feature-local instructions before judging the implementation.
3. Inspect the complete diff and the surrounding code needed to understand
   callers, state boundaries, serializers, decorators, and tests.
4. Use the repository's Fallow integration when available. Prefer its
   graph-grounded changed-code review for blast radius, dependency cycles,
   dead paths, duplication, complexity, and architecture-boundary risk. If
   Fallow is unavailable, continue with direct dependency and call-site
   inspection rather than failing the review.
5. Validate behavior with the narrowest relevant existing test, lint, typecheck,
   or build command. For UI changes, check rendering, geometry after scroll and
   resize, and SSR/hydration implications when applicable.
6. Re-read each finding against the diff. Report only actionable issues with
   concrete evidence and a plausible failure mode.

## Project-specific checks

- Treat the app-state API as the mutation boundary; flag direct app-state
  mutation or bypassed serializers.
- Check that public feature-facing types remain deeply readonly.
- For design components, verify registration through component metadata rather
  than consumer-side tag switches.
- For cross-cutting behavior, check the owning decorators and feature boundary.
- For serializers and imports, check validation of external app-node trees and
  malformed-input behavior.
- Preserve explicit DOM/layout requirements, including existing decorator
  structure and `display: contents` where required.
- Check changed code against the design principles and React rules in
  `docs/CONVENTIONS.md`: special cases that a more general mechanism would
  absorb, shallow modules with wide interfaces, nested conditionals or loops
  that guard clauses would flatten, unnecessary `useEffect`, large effects not
  extracted into custom hooks, and components that mix several hooks and
  computations with markup.
- Check that the change follows the redesign rule in `docs/AGENT-WORKFLOW.md`:
  flag patches that work around the old shape instead of restructuring it.
- Use the project's canonical terms from `docs/GLOSSARY.md` in findings.

## Finding standard

Rank findings by severity and confidence:

- **Critical**: exploitable security issue, data loss, or a release-blocking
  failure.
- **High**: likely correctness or compatibility regression in a common path.
- **Medium**: meaningful edge-case bug, missing validation, or architectural
  risk with a credible path to failure.
- **Low**: limited-impact issue or maintainability problem that should be fixed
  while the code is nearby.

Every finding must include:

- severity and confidence;
- an absolute file path and exact line number;
- the concrete problem and why it can occur;
- the smallest practical remediation direction.

Do not present personal stylistic preferences, hypothetical concerns without a
failure path, or a summary disguised as a finding. Violations of the documented
conventions above are not personal preferences: report them as Low, or Medium
when they add real maintenance risk. For these, the remediation direction may be
the structural fix rather than the smallest patch.

## Response format

Start with findings, highest severity first:

```text
## Findings

### [High] Short title
`/absolute/path/to/file.ts:42` — Explain the failure mode and affected path.
Confidence: 8/10.
Recommendation: Describe the minimal fix direction.
```

If there are no findings, say so explicitly and include residual validation
gaps or assumptions. Finish with:

- the validation commands run and their results;
- a brief scope summary;
- optional follow-up actions only if the user asks to fix or prepare a PR.
