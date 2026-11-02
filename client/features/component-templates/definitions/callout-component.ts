import { node, text } from "@/client/features/templates/template-helpers"
import { validateAndMigrateComponentTemplate, type ComponentTemplateDefinition } from "@/client/features/component-templates/schema"

export const calloutComponentTemplate = validateAndMigrateComponentTemplate({
  schema: "livepage-component-template",
  version: 1,
  id: "callout-component",
  metadata: {
    name: "Callout",
    description: "A highlighted callout box for drawing attention to important information.",
    category: "Content",
    tags: ["callout", "highlight", "notice"],
    thumbnail: "/component-template-thumbnails/callout-component.svg",
  },
  content: {
    root: [
      node("callout", "callout-root", {
        tone: "info",
      }, [
        text("header3", "callout-heading", "Important notice"),
        text("paragraph", "callout-body", "This is a callout component that can be placed inside any container on the page."),
      ]),
    ],
  } satisfies ComponentTemplateDefinition["content"],
} as const)
