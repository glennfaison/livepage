import type { ComponentTemplateDefinition } from "@/client/features/templates/component-schema"

export const featuresTemplate = {
  schema: "livepage-component-template",
  version: 1,
  id: "features",
  metadata: {
    name: "Features",
    description: "A heading with three feature columns, each with a title and description.",
    category: "Features",
    tags: ["features", "columns", "list", "benefits"],
    thumbnail: "/component-template-thumbnails/features.svg",
  },
  content: {
    root: {
      tag: "column",
      attributes: {
        id: "features-root",
        "custom-classes": "mx-auto w-full max-w-5xl py-24",
      },
      children: [
        {
          tag: "header2",
          attributes: { id: "features-heading" },
          children: ["Everything you need in one place"],
        },
        {
          tag: "paragraph",
          attributes: { id: "features-copy" },
          children: [
            "Powerful tools, thoughtful design, and reliable performance so you can focus on your work.",
          ],
        },
        {
          tag: "row",
          attributes: { id: "features-grid", "custom-classes": "gap-6 mt-12" },
          children: [
            {
              tag: "column",
              attributes: { id: "feature-1", "custom-classes": "flex-1" },
              children: [
                {
                  tag: "header3",
                  attributes: { id: "feature-1-heading" },
                  children: ["Fast publishing"],
                },
                {
                  tag: "paragraph",
                  attributes: { id: "feature-1-copy" },
                  children: ["Ship pages in minutes, not weeks."],
                },
              ],
            },
            {
              tag: "column",
              attributes: { id: "feature-2", "custom-classes": "flex-1" },
              children: [
                {
                  tag: "header3",
                  attributes: { id: "feature-2-heading" },
                  children: ["Responsive design"],
                },
                {
                  tag: "paragraph",
                  attributes: { id: "feature-2-copy" },
                  children: ["Looks great on every screen size."],
                },
              ],
            },
            {
              tag: "column",
              attributes: { id: "feature-3", "custom-classes": "flex-1" },
              children: [
                {
                  tag: "header3",
                  attributes: { id: "feature-3-heading" },
                  children: ["Built to convert"],
                },
                {
                  tag: "paragraph",
                  attributes: { id: "feature-3-copy" },
                  children: ["Layouts proven to turn visitors into customers."],
                },
              ],
            },
          ],
        },
      ],
    },
  },
} as const satisfies ComponentTemplateDefinition
