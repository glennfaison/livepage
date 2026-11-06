import type { ComponentTemplateDefinition } from "@/client/features/templates/component-schema"

export const heroTemplate = {
  schema: "livepage-component-template",
  version: 1,
  id: "hero",
  metadata: {
    name: "Hero",
    description: "A badge, headline, subheading, and call-to-action button for the top of a page or section.",
    category: "Hero",
    tags: ["hero", "banner", "headline", "call to action"],
    thumbnail: "/component-template-thumbnails/hero.svg",
  },
  content: {
    root: {
      tag: "column",
      attributes: {
        id: "hero-root",
        "custom-classes": "mx-auto w-full max-w-4xl text-center py-24",
      },
      children: [
        {
          tag: "badge",
          attributes: { id: "hero-badge", variant: "outline", "custom-classes": "text-[#6b5344]" },
          children: ["New collection"],
        },
        {
          tag: "header1",
          attributes: { id: "hero-heading" },
          children: ["Built to impress, designed to convert"],
        },
        {
          tag: "paragraph",
          attributes: { id: "hero-copy" },
          children: [
            "Everything you need to launch your next idea in one beautifully crafted section.",
          ],
        },
        {
          tag: "row",
          attributes: { id: "hero-actions", "custom-classes": "justify-center gap-3 mt-10" },
          children: [
            {
              tag: "column",
              attributes: { id: "hero-primary-col", "custom-classes": "w-full sm:w-auto" },
              children: [
                {
                  tag: "button",
                  attributes: {
                    id: "hero-button",
                    variant: "default",
                    size: "lg",
                    href: "#",
                    "custom-classes": "w-full sm:w-auto",
                  },
                  children: ["Get Started"],
                },
              ],
            },
            {
              tag: "column",
              attributes: { id: "hero-secondary-col", "custom-classes": "w-full sm:w-auto" },
              children: [
                {
                  tag: "button",
                  attributes: {
                    id: "hero-secondary-button",
                    variant: "outline",
                    size: "lg",
                    href: "#",
                    "custom-classes": "w-full sm:w-auto",
                  },
                  children: ["Learn More"],
                },
              ],
            },
          ],
        },
      ],
    },
  },
} as const satisfies ComponentTemplateDefinition
