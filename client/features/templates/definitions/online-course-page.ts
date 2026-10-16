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

const modules = [
  {
    key: "observe",
    title: "Reading the land",
    body: "Soil, aspect, and indicator plants: what the ground tells you before you name a single species.",
  },
  {
    key: "families",
    title: "Plant families you will actually use",
    body: "Ten families that cover most of what grows in temperate fields, hedgerows, and woodland edges.",
  },
  {
    key: "seasons",
    title: "Following a year in the field",
    body: "What to look for each month, from first spring ephemerals to winter buds and seed heads.",
  },
  {
    key: "record",
    title: "Keeping a field notebook",
    body: "Sketching, pressing, and note habits that turn casual walks into usable records.",
  },
] as const

export const onlineCoursePageTemplate = {
  schema: "livepage-template",
  version: 1,
  id: "online-course-page",
  metadata: {
    name: "Online Course",
    description: "A course landing page with a hero, instructor bio, curriculum outline, pricing, and an enrollment call to action.",
    category: "Education",
    tags: ["online course", "education", "learning", "landing page", "linkedin import"],
    thumbnail: "/template-thumbnails/online-course-page.svg",
  },
  dataMapping: {
    source: "linkedin-profile",
    fields: [
      {
        source: "name",
        description: "The instructor's name, shown in the course about section.",
        targets: [{ componentId: "course-instructor-name", kind: "text", field: "children" }],
      },
      {
        source: "headline",
        description: "Reused as the course tagline shown above the hero heading.",
        targets: [{ componentId: "course-subtitle", kind: "text", field: "children" }],
      },
      {
        source: "summary",
        description: "Reused as the course description in the hero section.",
        targets: [{ componentId: "course-description", kind: "text", field: "children" }],
      },
      {
        source: "skills",
        description: "Repeatable entries reinterpreted as curriculum modules: each skill becomes a module title.",
        repeatable: true,
        targets: [{ componentId: "course-curriculum-list", kind: "attribute", field: "children[]" }],
      },
    ],
  },
  content: {
    pages: [
      node("page", "course-page", {
        title: "Ridgeline — Introduction to Field Botany",
        "custom-classes": "border-0 bg-white text-[#1a1a1a] shadow-none",
      }, [
        node("column", "course-shell", { gap: "0", "custom-classes": "mx-auto w-full" }, [
          // 1. Navbar
          node("row", "course-nav", {
            "padding-top": "1.25rem",
            "padding-right": "2.5rem",
            "padding-bottom": "1.25rem",
            "padding-left": "2.5rem",
            "child-sizing": "natural",
            "align-items": "center",
            "justify-content": "between",
            gap: "1rem",
            "custom-classes": "mx-auto w-full max-w-6xl [&>*]:!self-center flex-wrap border-b border-[#e5e7ea] bg-white",
          }, [
            text("inline-text", "course-brand", "RIDGELINE COURSES", {
              "custom-classes": "text-xs font-bold tracking-[0.16em] text-[#4d4d4d]",
            }),
            node("row", "course-nav-actions", {
              "child-sizing": "natural",
              "align-items": "center",
              gap: "1rem",
              "custom-classes": "[&>*]:!self-center flex-wrap",
            }, [
              node("link", "course-nav-catalog", { href: "#browse", "custom-classes": "text-sm font-medium text-[#1a1a1a] hover:#6d6d6d" }, ["Browse courses"]),
              node("button", "course-nav-signin", { variant: "default", size: "sm", "custom-classes": "rounded-full border border-[#c9c9c9]" }, ["Sign in"]),
            ]),
          ]),
          // 2. Hero
          node("column", "course-hero", {
            "padding-top": "3rem",
            "padding-right": "2.5rem",
            "padding-bottom": "4rem",
            "padding-left": "2.5rem",
            gap: "1.5rem",
            "align-items": "center",
            "custom-classes": "mx-auto w-full max-w-3xl text-center bg-[#f7f5f0]",
          }, [
            text("badge", "course-hero-badge", "New course — starts Monday", {
              variant: "outline",
              "custom-classes": "w-fit rounded-full border-[#c9a26a] px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-[#8a5a2e]",
            }),
            text("paragraph", "course-subtitle", "Field botany for curious walkers.", {
              "custom-classes": "py-0 text-sm font-medium uppercase tracking-[0.1em] text-[#6d4c41]",
            }),
            text("header1", "course-hero-headline", "Learn to read a landscape like a naturalist.", {
              "custom-classes": "py-0 text-5xl font-semibold leading-[1.05] tracking-[-0.03em] text-[#1a1a1a] md:text-6xl",
            }),
            text("paragraph", "course-description", "Eight weeks of guided observation: plant families, seasonal change, and keeping a field notebook you will actually use.", {
              "custom-classes": "max-w-xl py-0 text-base leading-7 text-[#5a5a5a]",
            }),
            node("row", "course-hero-actions", {
              "child-sizing": "natural",
              "align-items": "center",
              "justify-content": "center",
              gap: "0.75rem",
              "custom-classes": "min-h-0 flex-wrap [&>*]:!self-center",
            }, [
              node("button", "course-hero-cta-enroll", { variant: "default", size: "lg", "custom-classes": "rounded-full bg-[#6d4c41] px-6 py-3 text-white font-semibold hover:bg-[#5a3d32]" }, ["Enroll in this course"]),
              node("link", "course-hero-cta-syllabus", { href: "#syllabus", "custom-classes": "inline-flex items-center rounded-full border border-[#c9c9c9] px-6 py-3 text-sm font-medium text-[#4d4d4d] hover:bg-[#f3f3f3]" }, ["View syllabus"]),
            ]),
            text("inline-text", "course-hero-meta", "Self-paced · 8 weeks · Certificate on completion", {
              "custom-classes": "text-xs text-[#8a8a8a]",
            }),
          ]),
          // 3. About / instructor
          node("column", "course-about", {
            id: "about",
            "padding-top": "3rem",
            "padding-right": "2.5rem",
            "padding-bottom": "3rem",
            "padding-left": "2.5rem",
            gap: "2rem",
            "custom-classes": "mx-auto w-full max-w-5xl border-y border-[#e5e7ea] bg-white",
          }, [
            node("column", "course-about-heading", { gap: "0.75rem", "align-items": "center", "custom-classes": "text-center" }, [
              text("inline-text", "course-about-eyebrow", "About this course", {
                "custom-classes": "text-xs font-semibold uppercase tracking-[0.16em] text-[#8a5a2e]",
              }),
              text("header2", "course-about-heading", "What you will learn", {
                "custom-classes": "py-0 text-3xl font-semibold tracking-[-0.03em] text-[#1a1a1a]",
              }),
            ]),
            node("row", "course-about-grid", {
              wrap: "wrap",
              gap: "1.5rem",
              "custom-classes": "[&>*]:!self-center flex-wrap",
            }, [
              node("column", "course-about-instructor", {
                "padding-top": "1.5rem",
                "padding-right": "1.5rem",
                "padding-bottom": "1.5rem",
                "padding-left": "1.5rem",
                gap: "0.75rem",
                "custom-classes": "min-w-0 flex-1 basis-[18rem] rounded-3xl border border-[#e5e7ea] bg-[#faf9f6]",
              }, [
                text("inline-text", "course-about-instructor-eyebrow", "Instructor", {
                  "custom-classes": "text-xs font-semibold tracking-[0.14em] text-[#8a5a2e]",
                }),
                text("header3", "course-instructor-name", "Elena Vasquez", {
                  "custom-classes": "py-0 text-lg font-semibold text-[#1a1a1a]",
                }),
                text("paragraph", "course-instructor-bio", "Elena is a field botanist and conservationist based in the Pacific Northwest. She teaches plant identification through close observation, not memorization.", {
                  "custom-classes": "py-0 text-sm leading-6 text-[#5a5a5a]",
                }),
                node("row", "course-instructor-meta", {
                  "child-sizing": "natural",
                  "align-items": "center",
                  gap: "0.75rem",
                  "custom-classes": "[&>*]:!self-center flex-wrap",
                }, [
                  text("inline-text", "course-instructor-role", "Field botanist & conservationist", {
                    "custom-classes": "text-sm text-[#8a8a8a]",
                  }),
                  text("inline-text", "course-instructor-location", "Pacific Northwest", {
                    "custom-classes": "text-sm text-[#8a8a8a]",
                  }),
                ]),
              ]),
              node("column", "course-about-details", {
                "padding-top": "1.5rem",
                "padding-right": "1.5rem",
                "padding-bottom": "1.5rem",
                "padding-left": "1.5rem",
                gap: "0.75rem",
                "custom-classes": "min-w-0 flex-1 basis-[18rem] rounded-3xl border border-[#e5e7ea] bg-[#faf9f6]",
              }, [
                text("header3", "course-about-details-heading", "Course at a glance", {
                  "custom-classes": "py-0 text-lg font-semibold text-[#1a1a1a]",
                }),
                text("paragraph", "course-about-duration", "8 weeks · self-paced · about 4 hours a week", {
                  "custom-classes": "py-0 text-sm leading-6 text-[#5a5a5a]",
                }),
                text("paragraph", "course-about-format", "Video lessons, field exercises, and short quizzes", {
                  "custom-classes": "py-0 text-sm leading-6 text-[#5a5a5a]",
                }),
                text("paragraph", "course-about-certificate", "Signed certificate on completion", {
                  "custom-classes": "py-0 text-sm leading-6 text-[#5a5a5a]",
                }),
              ]),
            ]),
          ]),
          // 4. Curriculum
          node("column", "course-curriculum", {
            id: "syllabus",
            "padding-top": "3rem",
            "padding-right": "2.5rem",
            "padding-bottom": "3rem",
            "padding-left": "2.5rem",
            gap: "2rem",
            "custom-classes": "mx-auto w-full max-w-5xl",
          }, [
            node("column", "course-curriculum-heading", { gap: "0.75rem" }, [
              text("inline-text", "course-curriculum-eyebrow", "Curriculum", {
                "custom-classes": "text-xs font-semibold uppercase tracking-[0.16em] text-[#8a5a2e]",
              }),
              text("header2", "course-curriculum-heading2", "Course curriculum", {
                "custom-classes": "py-0 text-3xl font-semibold tracking-[-0.03em] text-[#1a1a1a]",
              }),
            ]),
            node("column", "course-curriculum-list", {
              id: "course-curriculum-list",
              gap: "1rem",
            }, [
              ...modules.map((module) => node("column", `course-module-${module.key}`, {
                "padding-top": "1.25rem",
                "padding-right": "1.25rem",
                "padding-bottom": "1.25rem",
                "padding-left": "1.25rem",
                gap: "0.5rem",
                "custom-classes": "min-w-0 rounded-xl border border-[#e5e7ea] bg-white",
              }, [
                text("header3", `course-module-${module.key}-title`, module.title, {
                  "custom-classes": "py-0 text-lg font-semibold text-[#1a1a1a]",
                }),
                text("paragraph", `course-module-${module.key}-copy`, module.body, {
                  "custom-classes": "py-0 text-sm leading-6 text-[#5a5a5a]",
                }),
              ])),
            ]),
          ]),
          // 5. Pricing
          node("column", "course-pricing", {
            "padding-top": "3rem",
            "padding-right": "2.5rem",
            "padding-bottom": "3.5rem",
            "padding-left": "2.5rem",
            gap: "1.5rem",
            "align-items": "center",
            "custom-classes": "mx-auto w-full max-w-3xl text-center",
          }, [
            text("header2", "course-pricing-heading", "Pricing", {
              "custom-classes": "py-0 text-3xl font-semibold tracking-[-0.03em] text-[#1a1a1a]",
            }),
            node("row", "course-pricing-plans", {
              gap: "1.5rem",
              "custom-classes": "[&>*]:!self-center flex-wrap",
            }, [
              node("column", "course-plan-audit", {
                "padding-top": "1.75rem",
                "padding-right": "1.5rem",
                "padding-bottom": "1.75rem",
                "padding-left": "1.5rem",
                gap: "1rem",
                "justify-content": "between",
                "custom-classes": "min-w-0 rounded-3xl border border-[#e5e7ea] bg-white w-full md:w-[calc((100%-1.5rem)/2)]",
              }, [
                text("header3", "course-plan-audit-title", "Audit", {
                  "custom-classes": "py-0 text-sm font-semibold uppercase tracking-[0.12em] text-[#5a5a5a]",
                }),
                text("header2", "course-plan-audit-price", "$0", {
                  "custom-classes": "py-0 text-3xl font-semibold text-[#1a1a1a]",
                }),
                text("paragraph", "course-plan-audit-copy", "First two lessons free.", {
                  "custom-classes": "py-0 text-sm text-[#5a5a5a]",
                }),
                node("button", "course-plan-audit-cta", { variant: "outline", size: "default", "custom-classes": "w-full rounded-full border border-[#c9c9c9]" }, ["Start for free"]),
              ]),
              node("column", "course-plan-full", {
                "padding-top": "1.75rem",
                "padding-right": "1.5rem",
                "padding-bottom": "1.75rem",
                "padding-left": "1.5rem",
                gap: "1rem",
                "justify-content": "between",
                "custom-classes": "min-w-0 rounded-3xl border-2 border-[#6d4c41] bg-[#6d4c41] text-white w-full md:w-[calc((100%-1.5rem)/2)]",
              }, [
                text("badge", "course-plan-full-badge", "Most popular", {
                  variant: "default",
                  "custom-classes": "w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
                }),
                text("header3", "course-plan-full-title", "Full course", {
                  "custom-classes": "py-0 text-sm font-semibold uppercase tracking-[0.12em] text-[#f3f0ea]",
                }),
                text("header2", "course-plan-full-price", "$149", {
                  "custom-classes": "py-0 text-3xl font-semibold text-white",
                }),
                text("paragraph", "course-plan-full-copy", "All eight weeks, field exercises, and certificate.", {
                  "custom-classes": "py-0 text-sm text-[#d8dcd6]",
                }),
                node("button", "course-plan-full-cta", { variant: "default", size: "default", "custom-classes": "w-full rounded-full bg-white text-[#6d4c41] font-bold hover:bg-[#f3f0ea]" }, ["Enroll now"]),
              ]),
            ]),
          ]),
          // 6. FAQ
          node("column", "course-faq", {
            "padding-top": "3rem",
            "padding-right": "2.5rem",
            "padding-bottom": "3rem",
            "padding-left": "2.5rem",
            gap: "1.5rem",
            "custom-classes": "mx-auto w-full max-w-3xl border-t border-[#e5e7ea] bg-white",
          }, [
            text("header2", "course-faq-heading", "Questions?", {
              "custom-classes": "py-0 text-3xl font-semibold tracking-[-0.03em] text-[#1a1a1a]",
            }),
            node("column", "course-faq-list", { gap: "1rem" }, [
              node("column", "course-faq-1", {
                "padding-top": "1.25rem",
                "padding-right": "1.25rem",
                "padding-bottom": "1.25rem",
                "padding-left": "1.25rem",
                gap: "0.4rem",
                "custom-classes": "min-w-0 rounded-xl border border-[#e5e7ea] bg-[#faf9f6]",
              }, [
                text("header3", "course-faq-1-q", "Do I need prior experience?", {
                  "custom-classes": "py-0 text-base font-bold text-[#1a1a1a]",
                }),
                text("paragraph", "course-faq-1-a", "No. The course starts with how to observe, and builds from there.", {
                  "custom-classes": "py-0 text-sm leading-6 text-[#5a5a5a]",
                }),
              ]),
              node("column", "course-faq-2", {
                "padding-top": "1.25rem",
                "padding-right": "1.25rem",
                "padding-bottom": "1.25rem",
                "padding-left": "1.25rem",
                gap: "0.4rem",
                "custom-classes": "min-w-0 rounded-xl border border-[#e5e7ea] bg-[#faf9f6]",
              }, [
                text("header3", "course-faq-2-q", "How long do I have access?", {
                  "custom-classes": "py-0 text-base font-bold text-[#1a1a1a]",
                }),
                text("paragraph", "course-faq-2-a", "Forever. All lessons and updates are yours once you enroll.", {
                  "custom-classes": "py-0 text-sm leading-6 text-[#5a5a5a]",
                }),
              ]),
            ]),
          ]),
          // 7. Footer
          node("column", "course-footer", { gap: "0", "custom-classes": "w-full border-t border-[#e5e7ea] text-xs text-[#8a8a8a]" }, [
            node("column", "course-footer-inner", {
              "padding-top": "2rem",
              "padding-right": "2.5rem",
              "padding-bottom": "2rem",
              "padding-left": "2.5rem",
              gap: "1.5rem",
              "align-items": "center",
              "custom-classes": "mx-auto w-full max-w-5xl text-center",
            }, [
              text("inline-text", "course-footer-brand", "RIDGELINE COURSES · LEARN TO SEE THE LAND", {
                "custom-classes": "font-semibold tracking-[0.08em]",
              }),
              node("link", "course-footer-contact", { href: "mailto:hello@example.com", "custom-classes": "font-medium hover:#8a5a2e" }, ["Say hello"]),
            ]),
          ]),
        ]),
      ]),
    ],
  },
} as const satisfies PageTemplateDefinition
