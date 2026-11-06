import type { ComponentTemplateDefinition } from "@/client/features/templates/component-schema"

export const testimonialTemplate = {
  schema: "livepage-component-template",
  version: 1,
  id: "testimonial",
  metadata: {
    name: "Testimonial",
    description: "A customer quote with the author's name and role, useful for social proof.",
    category: "Feedback",
    tags: ["testimonial", "review", "quote", "social proof"],
    thumbnail: "/component-template-thumbnails/testimonial.svg",
  },
  content: {
    root: {
      tag: "column",
      attributes: {
        id: "testimonial-root",
        "custom-classes": "mx-auto w-full max-w-2xl text-center py-20",
      },
      children: [
        {
          tag: "badge",
          attributes: { id: "testimonial-badge", variant: "outline", "custom-classes": "text-[#6b5344]" },
          children: ["Customer story"],
        },
        {
          tag: "header3",
          attributes: { id: "testimonial-quote" },
          children: [
            "This page builder changed how we launch campaigns. We went from idea to live in a single afternoon.",
          ],
        },
        {
          tag: "paragraph",
          attributes: { id: "testimonial-author", "custom-classes": "mt-4 font-semibold" },
          children: ["— Maya Chen, Founder, Brightflow"],
        },
        {
          tag: "badge",
          attributes: { id: "testimonial-role", "custom-classes": "mt-2 text-xs" },
          children: ["Brightflow Design"],
        },
      ],
    },
  },
} as const satisfies ComponentTemplateDefinition
