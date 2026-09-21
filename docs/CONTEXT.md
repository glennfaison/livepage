# LivePage Agent Context

LivePage is a page-builder app organized around a central app state and feature folders for domain-specific concerns.

## Guidance

- Prefer the app-state API and serializers over direct state mutation.
- Keep public feature-facing types deeply readonly.
- Backward compatibility is not a priority yet; prefer clean refactors over shims.
- Placeholders are runtime tokens embedded in component strings and resolved before rendering.
- When improving UI polish or layout, prefer adding or updating design-component settings and attributes over hard-coding visual fixes into a specific template or component, unless the default component is incorrectly rendered and needs a structural fix.
- Read this context, the glossary, conventions, and relevant ADRs before changing cross-cutting component behavior.
- Keep focused UI fixes within the existing feature boundary; do not introduce new architectural abstractions or ADRs unless the task explicitly calls for them.

## Reference

- [App-state API](../features/app-state/)
- [Serializers](../features/serializers/)
- [Placeholders](../features/placeholders/)
- [Glossary](./GLOSSARY.md)
- [Architecture decisions](./adr/)
