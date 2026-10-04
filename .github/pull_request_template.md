## Summary

<!-- What does this change, and why? Link the issue: Closes #123 -->

## Testing

<!-- What you ran or checked. Prefer the narrowest relevant Jest selector first
     (e.g. npm test -- --runInBand path/to/test.test.tsx), then broader suites.
     Note any known baseline failures separately so they are not treated as regressions. -->

## Checklist

- [ ] `npm run lint` and the relevant `npm test` selectors pass (narrowest first, then broader)
- [ ] Known baseline failures are recorded separately and are not treated as new regressions
- [ ] Imports follow the `client`/`server`/`shared` runtime boundary and feature entry points (see [conventions](../.agents/docs/CONVENTIONS.md))
- [ ] [Glossary](../.agents/docs/GLOSSARY.md) updated if this adds or renames a domain term
- [ ] UI changes were checked in a browser against a **freshly restarted** dev server; screenshots attached where useful
- [ ] For editor controls, decorators, or positioned UI: verified real geometry after scroll and resize; checked client-only/portal rendering for SSR and hydration safety
- [ ] For template changes: judged in preview mode (`/try?template=<id>&mode=preview`), not only in edit mode
- [ ] Docs updated if behavior, commands, or formats changed
