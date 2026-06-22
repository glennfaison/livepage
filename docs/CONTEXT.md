# LivePage Agent Context

LivePage is a page-builder app organized around a central app state and feature folders for domain-specific concerns.

## Guidance

- Prefer the app-state API and serializers over direct state mutation.
- Keep public feature-facing types deeply readonly.
- Backward compatibility is not a priority yet; prefer clean refactors over shims.
- Placeholders are runtime tokens embedded in component strings and resolved before rendering.

## Reference

- [Glossary](./GLOSSARY.md)
- [Architecture decisions](./adr/)
