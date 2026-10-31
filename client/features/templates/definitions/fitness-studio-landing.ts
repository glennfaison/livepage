import type { PageTemplateDefinition } from "@/client/features/templates/schema"

type TemplateNode = Readonly<{
  tag: string
  attributes: Readonly<Record<string, string>>
  children: ReadonlyArray<TemplateNode | string>
}>

function node(
  tag: string,
  id: string,
  attributes: Readonly<Record<string, string>> = {},
  children: ReadonlyArray<TemplateNode | string> = [],
): TemplateNode {
  return { tag, attributes: { id, ...attributes }, children } as const
}

const text = (
  tag: "header1" | "header2" | "header3" | "paragraph" | "badge" | "button" | "callout" | "inline-text",
  id: string,
  content: string,
  attributes: Readonly<Record<string, string>> = {},
) => node(tag, id, attributes, [content])

export const fitnessStudioTemplate = {
  schema: "livepage-template",
  version: 1,
  id: "fitness-studio-landing",
  metadata: {
    name: "Fitness Studio",
    description: "A modern fitness studio landing page with class schedule highlights, trainer intro, and membership CTA.",
    category: "Health & Fitness",
    tags: ["fitness", "gym", "studio", "classes", "health", "landing page"],
    thumbnail: "/template-thumbnails/fitness-studio-landing.svg",
  },
  dataMapping: {
    source: "linkedin-profile",
    fields: [
      {
        source: "name",
        description: "Studio or founder name shown in the hero.",
        targets: [{ componentId: "studio-name", kind: "text", field: "children" }],
      },
      {
        source: "headline",
        description: "Tagline or specialty shown under the name.",
        targets: [{ componentId: "studio-tagline", kind: "text", field: "children" }],
      },
      {
        source: "summary",
        description: "Short story or mission of the studio.",
        targets: [{ componentId: "studio-story", kind: "text", field: "children" }],
      },
    ],
  },
  content: {
    pages: [
      node("page", "fitness-page", {
        title: "Apex Fitness Studio",
        "custom-classes": "border-0 bg-slate-950 text-white shadow-none",
      }, [
        node("column", "fitness-shell", { gap: "0", "custom-classes": "mx-auto w-full" }, [
          node("row", "fitness-nav", {
            "align-items": "center",
            "justify-content": "between",
            "padding-top": "1.25rem",
            "padding-right": "2rem",
            "padding-bottom": "1.25rem",
            "padding-left": "2rem",
            "custom-classes": "border-b border-slate-800",
          }, [
            text("inline-text", "studio-brand", "APEX FITNESS", {
              "custom-classes": "text-sm font-bold tracking-widest text-emerald-400",
            }),
            text("button", "join-now-btn", "Join Now", {
              "custom-classes": "rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950",
            }),
          ]),
          node("column", "fitness-hero", {
            gap: "1rem",
            "padding-top": "4rem",
            "padding-right": "2rem",
            "padding-bottom": "4rem",
            "padding-left": "2rem",
            "custom-classes": "items-center text-center",
          }, [
            text("header1", "studio-name", "Apex Fitness Studio", {
              "custom-classes": "text-4xl font-bold md:text-5xl",
            }),
            text("paragraph", "studio-tagline", "Strength. Mobility. Community.", {
              "custom-classes": "text-lg text-slate-300",
            }),
            text("button", "hero-cta", "Book a Free Class", {
              "custom-classes": "mt-4 rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-slate-950",
            }),
          ]),
          node("column", "fitness-story", {
            gap: "1rem",
            "padding-top": "3rem",
            "padding-right": "2rem",
            "padding-bottom": "3rem",
            "padding-left": "2rem",
            "custom-classes": "mx-auto max-w-2xl text-center",
          }, [
            text("header2", "story-heading", "Our Mission", {
              "custom-classes": "text-2xl font-semibold",
            }),
            text("paragraph", "studio-story", "We help people build lasting strength and confidence through expert-led classes in a welcoming space.", {
              "custom-classes": "text-slate-300",
            }),
          ]),
        ]),
      ]),
    ],
  },
} as const satisfies PageTemplateDefinition
