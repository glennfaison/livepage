import type { ComponentTemplateDefinition } from "@/client/features/templates/component-schema"

export const callToActionTemplate = {
  schema: "livepage-component-template",
  version: 1,
  id: "call-to-action",
  metadata: {
    name: "Call to Action",
    description: "A centered headline, supporting copy, and a primary button that drives one clear action.",
    category: "Conversion",
    tags: ["cta", "call to action", "button", "conversion", "hero"],
    thumbnail: "/component-template-thumbnails/call-to-action.svg",
  },
  content: {
    root: {
      tag: "column",
      attributes: {
        id: "cta-root",
        "custom-classes": "mx-auto w-full max-w-3xl text-center py-24",
      },
      children: [
        {
          tag: "header2",
          attributes: { id: "cta-heading" },
          children: ["Ready to grow your business?"],
        },
        {
          tag: "paragraph",
          attributes: { id: "cta-copy" },
          children: [
            "Join thousands of teams already shipping faster with a page built to convert visitors into customers.",
          ],
        },
        {
          tag: "row",
          attributes: { id: "cta-actions", "custom-classes": "justify-center gap-3 mt-8" },
          children: [
            {
              tag: "column",
              attributes: { id: "cta-button-col", "custom-classes": "w-full sm:w-auto" },
              children: [
                {
                  tag: "button",
                  attributes: {
                    id: "cta-button",
                    variant: "default",
                    size: "lg",
                    href: "#",
                    "custom-classes": "w-full sm:w-auto",
                  },
                  children: ["Get Started"],
                },
              ],
            },
          ],
        },
      ],
    },
  },
} as const satisfies ComponentTemplateDefinition
