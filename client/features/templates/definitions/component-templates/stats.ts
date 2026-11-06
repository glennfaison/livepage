import type { ComponentTemplateDefinition } from "@/client/features/templates/component-schema"

export const statsTemplate = {
  schema: "livepage-component-template",
  version: 1,
  id: "stats",
  metadata: {
    name: "Stats",
    description: "A heading with a row of headline statistics, each with a large value and a label.",
    category: "Data",
    tags: ["stats", "metrics", "numbers", "kpi"],
    thumbnail: "/component-template-thumbnails/stats.svg",
  },
  content: {
    root: {
      tag: "column",
      attributes: {
        id: "stats-root",
        "custom-classes": "mx-auto w-full max-w-4xl py-24",
      },
      children: [
        {
          tag: "header2",
          attributes: { id: "stats-heading" },
          children: ["Trusted by teams worldwide"],
        },
        {
          tag: "row",
          attributes: { id: "stats-grid", "custom-classes": "justify-between gap-8 mt-12" },
          children: [
            {
              tag: "column",
              attributes: { id: "stat-1", "custom-classes": "text-center" },
              children: [
                {
                  tag: "stat",
                  attributes: { id: "stat-1-value", value: "500+" },
                  children: ["Projects delivered"],
                },
              ],
            },
            {
              tag: "column",
              attributes: { id: "stat-2", "custom-classes": "text-center" },
              children: [
                {
                  tag: "stat",
                  attributes: { id: "stat-2-value", value: "99%" },
                  children: ["Customer satisfaction"],
                },
              ],
            },
            {
              tag: "column",
              attributes: { id: "stat-3", "custom-classes": "text-center" },
              children: [
                {
                  tag: "stat",
                  attributes: { id: "stat-3-value", value: "12" },
                  children: ["Years in business"],
                },
              ],
            },
          ],
        },
      ],
    },
  },
} as const satisfies ComponentTemplateDefinition
