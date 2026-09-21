import type { PageTemplateDefinition } from "@/features/templates/schema"

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
  return {
    tag,
    attributes: {
      id,
      ...attributes,
    },
    children,
  } as const
}

const text = (
  tag: "header1" | "header2" | "header3" | "paragraph" | "badge" | "button" | "callout" | "inline-text",
  id: string,
  content: string,
  attributes: Readonly<Record<string, string>> = {},
) => node(tag, id, attributes, [content])

export const cvResumePersonalTemplate = {
  schema: "livepage-template",
  version: 1,
  id: "cv-resume-personal-website",
  metadata: {
    name: "Personal CV / Resume",
    description: "A one-page resume and personal website layout for LinkedIn-shaped profile data.",
    category: "CV/Resume/Personal",
    tags: ["resume", "cv", "personal website", "portfolio", "linkedin import"],
    thumbnail: "/template-thumbnails/cv-resume-personal.svg",
  },
  dataMapping: {
    source: "linkedin-profile",
    fields: [
      {
        source: "name",
        description: "Primary profile name used in the hero heading.",
        targets: [{ componentId: "cv-hero-name", kind: "text", field: "children" }],
      },
      {
        source: "headline",
        description: "Professional headline shown beneath the hero heading.",
        targets: [{ componentId: "cv-hero-headline", kind: "text", field: "children" }],
      },
      {
        source: "summary",
        description: "Profile summary/about text for the intro section.",
        targets: [{ componentId: "cv-about-copy", kind: "text", field: "children" }],
      },
      {
        source: "profilePhotoUrl",
        description: "Profile photo URL for the hero image source.",
        targets: [{ componentId: "cv-profile-photo", kind: "attribute", field: "src" }],
      },
      {
        source: "email, phone, location",
        description: "Primary contact details grouped in the sidebar contact block.",
        targets: [
          { componentId: "cv-contact-primary", kind: "text", field: "children" },
          { componentId: "cv-contact-secondary", kind: "text", field: "children" },
        ],
      },
      {
        source: "linkedinUrl, githubUrl, websiteUrl",
        description: "Public profile links grouped in the sidebar contact block.",
        targets: [{ componentId: "cv-contact-links", kind: "text", field: "children" }],
      },
      {
        source: "positions",
        description: "Repeatable experience entries with title, company, dates, and highlights.",
        repeatable: true,
        targets: [
          { componentId: "cv-experience-list", kind: "attribute", field: "children[]" },
        ],
      },
      {
        source: "education",
        description: "Repeatable education entries with school, degree, and dates.",
        repeatable: true,
        targets: [
          { componentId: "cv-education-list", kind: "attribute", field: "children[]" },
        ],
      },
      {
        source: "skills",
        description: "A repeatable list of skill tags.",
        repeatable: true,
        targets: [
          { componentId: "cv-skills-list", kind: "attribute", field: "children[]" },
        ],
      },
      {
        source: "projects, certifications, languages",
        description: "Optional repeatable supporting sections.",
        repeatable: true,
        targets: [
          { componentId: "cv-projects-list", kind: "attribute", field: "children[]" },
          { componentId: "cv-certifications-list", kind: "attribute", field: "children[]" },
          { componentId: "cv-languages-copy", kind: "text", field: "children" },
        ],
      },
    ],
  },
  content: {
    pages: [
      node("page", "cv-template-page", {
        title: "Avery Johnson — Personal CV",
        "custom-classes": "border-0 shadow-none bg-slate-50",
      }, [
        node("row", "cv-shell", {
          "custom-classes": "items-start gap-8 flex-wrap xl:flex-nowrap",
        }, [
          node("column", "cv-sidebar", {
            "custom-classes": "basis-[20rem] flex-none rounded-[2rem] bg-slate-900 p-8 text-white shadow-sm gap-5 xl:sticky xl:top-8",
          }, [
            node("image", "cv-profile-photo", {
              alt: "Avery Johnson portrait placeholder",
              src: "",
              fallbackSrc: "/placeholder-img.svg?height=480&width=480",
              width: "100%",
              height: "320px",
              objectFit: "cover",
              objectPosition: "center",
              borderRadius: "24px",
              loading: "lazy",
              decoding: "async",
              "custom-classes": "w-full overflow-hidden bg-slate-800",
            }),
            text("badge", "cv-hero-status", "Open to staff product and design leadership roles", {
              variant: "warning",
            }),
            text("header1", "cv-hero-name", "Avery Johnson", {
              "custom-classes": "py-0 text-4xl font-semibold tracking-tight text-white",
            }),
            text("paragraph", "cv-hero-headline", "Product designer and front-end engineer building accessible healthcare and education products.", {
              "custom-classes": "py-0 text-base leading-7 text-slate-300",
            }),
            node("divider", "cv-sidebar-divider-1", {
              color: "#334155",
              style: "solid",
            }),
            text("header3", "cv-contact-heading", "Contact", {
              "custom-classes": "py-0 text-lg text-white",
            }),
            text("paragraph", "cv-contact-primary", "avery@example.com • +1 (555) 123-4567", {
              "custom-classes": "py-0 text-sm leading-6 text-slate-300",
            }),
            text("paragraph", "cv-contact-secondary", "Based in Atlanta, GA • Available for remote collaboration", {
              "custom-classes": "py-0 text-sm leading-6 text-slate-300",
            }),
            text("paragraph", "cv-contact-links", "linkedin.com/in/averyjohnson • github.com/averycodes • averyjohnson.design", {
              "custom-classes": "py-0 text-sm leading-6 text-slate-300",
            }),
            node("divider", "cv-sidebar-divider-2", {
              color: "#334155",
              style: "solid",
            }),
            text("header3", "cv-skills-heading", "Skills", {
              "custom-classes": "py-0 text-lg text-white",
            }),
            node("column", "cv-skills-list", {
              "custom-classes": "gap-2",
            }, [
              text("badge", "cv-skill-1", "Design systems", { variant: "secondary" }),
              text("badge", "cv-skill-2", "Product strategy", { variant: "secondary" }),
              text("badge", "cv-skill-3", "React / Next.js", { variant: "secondary" }),
              text("badge", "cv-skill-4", "Accessibility", { variant: "secondary" }),
              text("badge", "cv-skill-5", "UX research", { variant: "secondary" }),
              text("badge", "cv-skill-6", "Cross-functional leadership", { variant: "secondary" }),
            ]),
            node("divider", "cv-sidebar-divider-3", {
              color: "#334155",
              style: "solid",
            }),
            text("header3", "cv-languages-heading", "Languages", {
              "custom-classes": "py-0 text-lg text-white",
            }),
            text("paragraph", "cv-languages-copy", "English (native), Spanish (professional working proficiency)", {
              "custom-classes": "py-0 text-sm leading-6 text-slate-300",
            }),
          ]),
          node("column", "cv-main", {
            "custom-classes": "min-w-0 gap-6 rounded-[2rem] bg-white p-8 shadow-sm",
          }, [
            text("header2", "cv-about-heading", "About", {
              "custom-classes": "py-0 text-2xl text-slate-900",
            }),
            text("paragraph", "cv-about-copy", "I design and ship polished digital experiences for teams that care deeply about clarity, trust, and measurable outcomes. Over the last eight years I have led end-to-end product design, partnered closely with engineering, and built front-end prototypes that accelerated launches across regulated industries.", {
              "custom-classes": "py-0 text-base leading-8 text-slate-600",
            }),
            node("row", "cv-stat-row", {
              "custom-classes": "gap-4 flex-wrap md:flex-nowrap",
            }, [
              node("column", "cv-stat-col-1", {
                "custom-classes": "basis-0 min-w-[12rem]",
              }, [
                node("stat", "cv-stat-1", {
                  value: "8+",
                  "custom-classes": "border-slate-200 shadow-none",
                }, ["Years building digital products"]),
              ]),
              node("column", "cv-stat-col-2", {
                "custom-classes": "basis-0 min-w-[12rem]",
              }, [
                node("stat", "cv-stat-2", {
                  value: "14",
                  "custom-classes": "border-slate-200 shadow-none",
                }, ["Cross-functional launches"]),
              ]),
              node("column", "cv-stat-col-3", {
                "custom-classes": "basis-0 min-w-[12rem]",
              }, [
                node("stat", "cv-stat-3", {
                  value: "5",
                  "custom-classes": "border-slate-200 shadow-none",
                }, ["Teams mentored through design systems work"]),
              ]),
            ]),
            node("divider", "cv-main-divider-1", {
              color: "#e2e8f0",
              style: "solid",
            }),
            text("header2", "cv-experience-heading", "Experience", {
              "custom-classes": "py-0 text-2xl text-slate-900",
            }),
            node("column", "cv-experience-list", {
              "custom-classes": "gap-4",
            }, [
              node("column", "cv-experience-1", {
                "custom-classes": "rounded-3xl border border-slate-200 bg-slate-50 p-6 gap-3",
              }, [
                text("header3", "cv-experience-1-title", "Senior Product Designer · Northstar Health", {
                  "custom-classes": "py-0 text-xl text-slate-900",
                }),
                text("paragraph", "cv-experience-1-meta", "Remote • 2023 — Present", {
                  "custom-classes": "py-0 text-sm uppercase tracking-[0.18em] text-slate-500",
                }),
                text("paragraph", "cv-experience-1-copy-1", "Led the redesign of a patient onboarding journey that improved activation by 28% across web and mobile.", {
                  "custom-classes": "py-0 text-base leading-7 text-slate-600",
                }),
                text("paragraph", "cv-experience-1-copy-2", "Partnered with engineering to launch a reusable appointment booking system and document an accessibility-first design system.", {
                  "custom-classes": "py-0 text-base leading-7 text-slate-600",
                }),
              ]),
              node("column", "cv-experience-2", {
                "custom-classes": "rounded-3xl border border-slate-200 bg-slate-50 p-6 gap-3",
              }, [
                text("header3", "cv-experience-2-title", "Product Designer · Classroom Loop", {
                  "custom-classes": "py-0 text-xl text-slate-900",
                }),
                text("paragraph", "cv-experience-2-meta", "Atlanta, GA • 2020 — 2023", {
                  "custom-classes": "py-0 text-sm uppercase tracking-[0.18em] text-slate-500",
                }),
                text("paragraph", "cv-experience-2-copy-1", "Shaped a teacher dashboard used by more than 40,000 educators, translating research findings into measurable product bets.", {
                  "custom-classes": "py-0 text-base leading-7 text-slate-600",
                }),
                text("paragraph", "cv-experience-2-copy-2", "Built React prototypes for curriculum planning and collaborated with product managers on roadmap sequencing.", {
                  "custom-classes": "py-0 text-base leading-7 text-slate-600",
                }),
              ]),
              node("column", "cv-experience-3", {
                "custom-classes": "rounded-3xl border border-slate-200 bg-slate-50 p-6 gap-3",
              }, [
                text("header3", "cv-experience-3-title", "UX Designer · Harbor Studio", {
                  "custom-classes": "py-0 text-xl text-slate-900",
                }),
                text("paragraph", "cv-experience-3-meta", "Savannah, GA • 2017 — 2020", {
                  "custom-classes": "py-0 text-sm uppercase tracking-[0.18em] text-slate-500",
                }),
                text("paragraph", "cv-experience-3-copy-1", "Designed marketing and onboarding sites for B2B SaaS clients, balancing brand storytelling with conversion performance.", {
                  "custom-classes": "py-0 text-base leading-7 text-slate-600",
                }),
                text("paragraph", "cv-experience-3-copy-2", "Established reusable landing-page patterns that shortened delivery timelines for new client launches.", {
                  "custom-classes": "py-0 text-base leading-7 text-slate-600",
                }),
              ]),
            ]),
            node("divider", "cv-main-divider-2", {
              color: "#e2e8f0",
              style: "solid",
            }),
            text("header2", "cv-education-heading", "Education", {
              "custom-classes": "py-0 text-2xl text-slate-900",
            }),
            node("column", "cv-education-list", {
              "custom-classes": "gap-4",
            }, [
              node("column", "cv-education-1", {
                "custom-classes": "rounded-3xl border border-slate-200 bg-white p-5 gap-2",
              }, [
                text("header3", "cv-education-1-title", "M.S. Human-Computer Interaction · Georgia Tech", {
                  "custom-classes": "py-0 text-xl text-slate-900",
                }),
                text("paragraph", "cv-education-1-meta", "2015 — 2017", {
                  "custom-classes": "py-0 text-sm uppercase tracking-[0.18em] text-slate-500",
                }),
                text("paragraph", "cv-education-1-copy", "Focused on interaction design, accessibility, and participatory research methods.", {
                  "custom-classes": "py-0 text-base leading-7 text-slate-600",
                }),
              ]),
              node("column", "cv-education-2", {
                "custom-classes": "rounded-3xl border border-slate-200 bg-white p-5 gap-2",
              }, [
                text("header3", "cv-education-2-title", "B.A. Graphic Design · Savannah College of Art and Design", {
                  "custom-classes": "py-0 text-xl text-slate-900",
                }),
                text("paragraph", "cv-education-2-meta", "2011 — 2015", {
                  "custom-classes": "py-0 text-sm uppercase tracking-[0.18em] text-slate-500",
                }),
                text("paragraph", "cv-education-2-copy", "Built a strong foundation in visual systems, brand storytelling, and digital production.", {
                  "custom-classes": "py-0 text-base leading-7 text-slate-600",
                }),
              ]),
            ]),
            node("divider", "cv-main-divider-3", {
              color: "#e2e8f0",
              style: "solid",
            }),
            text("header2", "cv-projects-heading", "Projects", {
              "custom-classes": "py-0 text-2xl text-slate-900",
            }),
            node("column", "cv-projects-list", {
              "custom-classes": "gap-3",
            }, [
              text("callout", "cv-project-1", "Clinical handoff dashboard — Designed a high-trust interface for care teams to review patient readiness before discharge.", {
                tone: "info",
              }),
              text("callout", "cv-project-2", "Design crit playbook — Published an internal facilitation toolkit that helped new managers run more effective review sessions.", {
                tone: "success",
              }),
            ]),
            node("divider", "cv-main-divider-4", {
              color: "#e2e8f0",
              style: "solid",
            }),
            text("header2", "cv-certifications-heading", "Certifications", {
              "custom-classes": "py-0 text-2xl text-slate-900",
            }),
            node("column", "cv-certifications-list", {
              "custom-classes": "gap-2",
            }, [
              text("badge", "cv-certification-1", "NN/g UX Certification", { variant: "outline" }),
              text("badge", "cv-certification-2", "Professional Scrum Product Owner I", { variant: "outline" }),
              text("badge", "cv-certification-3", "IAAP CPACC", { variant: "outline" }),
            ]),
          ]),
        ]),
      ]),
    ],
  },
} as const satisfies PageTemplateDefinition
