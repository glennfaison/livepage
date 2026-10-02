# LivePage agent guidance

Entry point for coding agents. Read the linked guidance that applies before changing related code.

- [Project context](./docs/CONTEXT.md): architecture, module map, and compatibility posture
- [Code conventions](./docs/CONVENTIONS.md): design principles, validation, React, styling, and module-boundary rules
- [Agent workflow](./docs/AGENT-WORKFLOW.md): how to scope, test, and finish a task
- [Domain glossary](./docs/GLOSSARY.md): canonical terms for entities and relationships
- [Architecture decisions](./docs/adr/): accepted design decisions and their constraints
- [README](./README.md): setup and development commands
- [package.json](./package.json): authoritative build, lint, and test scripts

## Skills

Skills live in [.github/skills/](./.github/skills/).

- [Agent orchestration](./.github/skills/agent-orchestration/SKILL.md): design, code and review sub-agents with handoffs; use for any non-trivial task
- [Handoff](./.github/skills/handoff/SKILL.md): pass work between agents
- [Code review](./.github/skills/code-review/SKILL.md): review current changes
- [Template authoring](./.github/skills/template-authoring/SKILL.md) and [template design review](./.github/skills/template-design-review/SKILL.md): the build-and-evaluate loop for Templates
- [Fallow](./.github/skills/fallow-skills/fallow/skills/fallow/SKILL.md): static analysis for dead code, duplication and architecture boundaries
- [TypeSafe AI](./.github/skills/typesafe-ai/SKILL.md): AI-powered features
