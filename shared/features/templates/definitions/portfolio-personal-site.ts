import type { PageTemplateDefinition } from "@/shared/features/templates/schema"

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

export const portfolioPersonalSiteTemplate = {
  schema: "livepage-template",
  version: 1,
  id: "portfolio-personal-site",
  metadata: {
    name: "Portfolio / Personal Site",
    description: "A visual, project-first personal site for showcasing work, highlights, and a way to get in touch.",
    category: "Portfolio",
    tags: ["portfolio", "personal website", "case studies", "creative", "linkedin import"],
    thumbnail: "/template-thumbnails/portfolio-personal-site.svg",
  },
  dataMapping: {
    source: "linkedin-profile",
    fields: [
      {
        source: "name",
        description: "Primary profile name used in the hero heading.",
        targets: [{ componentId: "portfolio-hero-name", kind: "text", field: "children" }],
      },
      {
        source: "headline",
        description: "Professional headline shown beneath the hero heading.",
        targets: [{ componentId: "portfolio-hero-headline", kind: "text", field: "children" }],
      },
      {
        source: "summary",
        description: "Profile summary used as the about-section copy.",
        targets: [{ componentId: "portfolio-about-copy", kind: "text", field: "children" }],
      },
      {
        source: "profilePhotoUrl",
        description: "Profile photo URL for the hero image source.",
        targets: [{ componentId: "portfolio-hero-photo", kind: "attribute", field: "src" }],
      },
      {
        source: "email, phone, location",
        description: "Primary contact details shown in the contact section.",
        targets: [
          { componentId: "portfolio-contact-primary", kind: "text", field: "children" },
        ],
      },
      {
        source: "linkedinUrl, githubUrl, websiteUrl",
        description: "Public profile links shown in the contact section.",
        targets: [{ componentId: "portfolio-contact-links", kind: "attribute", field: "children[]" }],
      },
      {
        source: "positions",
        description: "Repeatable experience entries summarized as career highlights.",
        repeatable: true,
        targets: [
          { componentId: "portfolio-highlights-list", kind: "attribute", field: "children[]" },
        ],
      },
      {
        source: "skills",
        description: "A repeatable list of skill tags.",
        repeatable: true,
        targets: [
          { componentId: "portfolio-skills-list", kind: "attribute", field: "children[]" },
        ],
      },
      {
        source: "projects",
        description: "Repeatable featured-work entries with a title and short description.",
        repeatable: true,
        targets: [
          { componentId: "portfolio-projects-list", kind: "attribute", field: "children[]" },
        ],
      },
    ],
  },
  content: {
    pages: [
      node("page", "portfolio-template-page", {
        title: "Maya Chen — Portfolio",
        "custom-classes": "border-0 bg-[#faf9f7] shadow-none",
      }, [
        node("column", "portfolio-shell", {
          "padding-top": "3rem",
          "padding-right": "2rem",
          "padding-bottom": "3rem",
          "padding-left": "2rem",
          "gap": "3.5rem",
          "custom-classes": "mx-auto w-full max-w-5xl",
        }, [
          node("row", "portfolio-hero", {
            "child-sizing": "natural",
            "align-items": "center",
            "justify-content": "between",
            "gap": "2.5rem",
            "custom-classes": "flex-wrap-reverse md:flex-nowrap",
          }, [
            node("column", "portfolio-hero-copy", {
              "gap": "1.25rem",
              "custom-classes": "min-w-0 flex-1",
            }, [
              text("badge", "portfolio-hero-status", "Available for select freelance projects", {
                variant: "success",
                "custom-classes": "w-fit rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
              }),
              text("header1", "portfolio-hero-name", "Maya Chen", {
                "custom-classes": "py-0 text-5xl font-semibold tracking-[-0.04em] text-slate-900 md:text-6xl",
              }),
              text("paragraph", "portfolio-hero-headline", "Product designer crafting brand-forward digital experiences for growing startups.", {
                "custom-classes": "max-w-md py-0 text-lg leading-8 text-slate-600",
              }),
              node("row", "portfolio-hero-actions", {
                "padding-top": "0.5rem",
                "child-sizing": "natural",
                "align-items": "center",
                "gap": "0.75rem",
              }, [
                node("link", "portfolio-hero-cta-work", {
                  href: "#work",
                  "custom-classes": "inline-flex items-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700",
                }, ["View my work"]),
                node("link", "portfolio-hero-cta-contact", {
                  href: "#contact",
                  "custom-classes": "inline-flex items-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100",
                }, ["Get in touch"]),
              ]),
            ]),
            node("image", "portfolio-hero-photo", {
              alt: "Maya Chen portrait placeholder",
              src: "",
              fallbackSrc: "/placeholder-img.svg?height=420&width=420",
              width: "260px",
              height: "260px",
              objectFit: "cover",
              objectPosition: "center",
              borderRadius: "28px",
              loading: "lazy",
              decoding: "async",
              "custom-classes": "flex-none overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-100 shadow-[0_18px_44px_rgba(15,23,42,0.08)]",
            }),
          ]),
          node("row", "portfolio-stat-row", {
            "gap": "1rem",
            "custom-classes": "flex-wrap md:flex-nowrap",
          }, [
            node("column", "portfolio-stat-col-1", { "custom-classes": "min-w-0 flex-1" }, [
              node("stat", "portfolio-stat-1", {
                value: "7+",
                "custom-classes": "rounded-2xl border border-slate-200 bg-white shadow-none",
              }, ["Years in product design"]),
            ]),
            node("column", "portfolio-stat-col-2", { "custom-classes": "min-w-0 flex-1" }, [
              node("stat", "portfolio-stat-2", {
                value: "30+",
                "custom-classes": "rounded-2xl border border-slate-200 bg-white shadow-none",
              }, ["Shipped products & campaigns"]),
            ]),
            node("column", "portfolio-stat-col-3", { "custom-classes": "min-w-0 flex-1" }, [
              node("stat", "portfolio-stat-3", {
                value: "12",
                "custom-classes": "rounded-2xl border border-slate-200 bg-white shadow-none",
              }, ["Startups and studios worked with"]),
            ]),
          ]),
          node("column", "portfolio-about-section", {
            "gap": "1rem",
          }, [
            text("header2", "portfolio-about-heading", "About", {
              "custom-classes": "py-0 text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-slate-500",
            }),
            text("paragraph", "portfolio-about-copy", "I partner with founders and product teams to turn early ideas into brands and interfaces people trust. My work blends visual craft with a strong point of view on usability, and I like being close to the strategy work that shapes it.", {
              "custom-classes": "max-w-3xl py-0 text-[1.05rem] leading-8 text-slate-600",
            }),
            node("column", "portfolio-skills-list", {
              "padding-top": "0.5rem",
              "custom-classes": "flex-row flex-wrap items-start gap-2",
            }, [
              text("badge", "portfolio-skill-1", "Brand identity", { variant: "secondary" }),
              text("badge", "portfolio-skill-2", "Product design", { variant: "secondary" }),
              text("badge", "portfolio-skill-3", "Design systems", { variant: "secondary" }),
              text("badge", "portfolio-skill-4", "Prototyping", { variant: "secondary" }),
              text("badge", "portfolio-skill-5", "Webflow / Framer", { variant: "secondary" }),
            ]),
          ]),
          node("divider", "portfolio-divider-1", {
            color: "#e2e8f0",
            style: "solid",
          }),
          node("column", "portfolio-work-section", {
            id: "work",
            "gap": "1.5rem",
          }, [
            text("header2", "portfolio-work-heading", "Featured work", {
              "custom-classes": "py-0 text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-slate-500",
            }),
            node("row", "portfolio-projects-list", {
              "gap": "1.25rem",
              "custom-classes": "flex-wrap md:flex-nowrap",
            }, [
              node("column", "portfolio-project-1", {
                "padding-top": "1.5rem",
                "padding-right": "1.5rem",
                "padding-bottom": "1.5rem",
                "padding-left": "1.5rem",
                "gap": "0.75rem",
                "custom-classes": "min-w-0 flex-1 rounded-3xl border border-slate-200 bg-white",
              }, [
                node("image", "portfolio-project-1-image", {
                  alt: "Orbit onboarding case study cover",
                  src: "",
                  fallbackSrc: "/placeholder-img.svg?height=320&width=480",
                  width: "100%",
                  height: "160px",
                  objectFit: "cover",
                  borderRadius: "16px",
                  loading: "lazy",
                  decoding: "async",
                  "custom-classes": "w-full overflow-hidden rounded-2xl bg-slate-100",
                }),
                text("header3", "portfolio-project-1-title", "Orbit — onboarding redesign", {
                  "custom-classes": "py-0 text-lg font-semibold text-slate-900",
                }),
                text("paragraph", "portfolio-project-1-copy", "Rebuilt a confusing signup flow into a guided experience, lifting activation by 34%.", {
                  "custom-classes": "py-0 text-sm leading-6 text-slate-600",
                }),
              ]),
              node("column", "portfolio-project-2", {
                "padding-top": "1.5rem",
                "padding-right": "1.5rem",
                "padding-bottom": "1.5rem",
                "padding-left": "1.5rem",
                "gap": "0.75rem",
                "custom-classes": "min-w-0 flex-1 rounded-3xl border border-slate-200 bg-white",
              }, [
                node("image", "portfolio-project-2-image", {
                  alt: "Fieldnote brand system cover",
                  src: "",
                  fallbackSrc: "/placeholder-img.svg?height=320&width=480",
                  width: "100%",
                  height: "160px",
                  objectFit: "cover",
                  borderRadius: "16px",
                  loading: "lazy",
                  decoding: "async",
                  "custom-classes": "w-full overflow-hidden rounded-2xl bg-slate-100",
                }),
                text("header3", "portfolio-project-2-title", "Fieldnote — brand system", {
                  "custom-classes": "py-0 text-lg font-semibold text-slate-900",
                }),
                text("paragraph", "portfolio-project-2-copy", "Designed a flexible identity system spanning product, marketing site, and pitch materials.", {
                  "custom-classes": "py-0 text-sm leading-6 text-slate-600",
                }),
              ]),
              node("column", "portfolio-project-3", {
                "padding-top": "1.5rem",
                "padding-right": "1.5rem",
                "padding-bottom": "1.5rem",
                "padding-left": "1.5rem",
                "gap": "0.75rem",
                "custom-classes": "min-w-0 flex-1 rounded-3xl border border-slate-200 bg-white",
              }, [
                node("image", "portfolio-project-3-image", {
                  alt: "Northline dashboard cover",
                  src: "",
                  fallbackSrc: "/placeholder-img.svg?height=320&width=480",
                  width: "100%",
                  height: "160px",
                  objectFit: "cover",
                  borderRadius: "16px",
                  loading: "lazy",
                  decoding: "async",
                  "custom-classes": "w-full overflow-hidden rounded-2xl bg-slate-100",
                }),
                text("header3", "portfolio-project-3-title", "Northline — analytics dashboard", {
                  "custom-classes": "py-0 text-lg font-semibold text-slate-900",
                }),
                text("paragraph", "portfolio-project-3-copy", "Simplified a dense reporting tool into a dashboard sales teams actually use daily.", {
                  "custom-classes": "py-0 text-sm leading-6 text-slate-600",
                }),
              ]),
            ]),
          ]),
          node("divider", "portfolio-divider-2", {
            color: "#e2e8f0",
            style: "solid",
          }),
          node("column", "portfolio-highlights-section", {
            "gap": "1rem",
          }, [
            text("header2", "portfolio-highlights-heading", "Career highlights", {
              "custom-classes": "py-0 text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-slate-500",
            }),
            node("column", "portfolio-highlights-list", {
              "gap": "0.75rem",
            }, [
              text("callout", "portfolio-highlight-1", "Lead Product Designer at Orbit — grew design team from 1 to 5 and shipped a full design system.", {
                tone: "info",
              }),
              text("callout", "portfolio-highlight-2", "Senior Designer at Fieldnote — led the rebrand behind a $12M Series A raise.", {
                tone: "success",
              }),
              text("callout", "portfolio-highlight-3", "Freelance — partnered with 12+ early-stage startups on brand and product design.", {
                tone: "info",
              }),
            ]),
          ]),
          node("divider", "portfolio-divider-3", {
            color: "#e2e8f0",
            style: "solid",
          }),
          node("column", "portfolio-contact-section", {
            id: "contact",
            "gap": "1rem",
            "custom-classes": "rounded-3xl bg-slate-900 p-10 text-white",
          }, [
            text("header2", "portfolio-contact-heading", "Let's work together", {
              "custom-classes": "py-0 text-2xl font-semibold text-white",
            }),
            text("paragraph", "portfolio-contact-primary", "maya@example.com • Based in Portland, OR • Open to remote & on-site collaborations", {
              "custom-classes": "py-0 text-sm leading-6 text-slate-300",
            }),
            node("row", "portfolio-contact-links", {
              "padding-top": "0.5rem",
              "child-sizing": "natural",
              "align-items": "center",
              "gap": "1rem",
            }, [
              node("link", "portfolio-contact-link-linkedin", {
                href: "https://linkedin.com",
                target: "_blank",
                "custom-classes": "text-sm font-medium text-white underline-offset-4 hover:underline",
              }, ["LinkedIn"]),
              node("link", "portfolio-contact-link-github", {
                href: "https://github.com",
                target: "_blank",
                "custom-classes": "text-sm font-medium text-white underline-offset-4 hover:underline",
              }, ["GitHub"]),
              node("link", "portfolio-contact-link-website", {
                href: "https://example.com",
                target: "_blank",
                "custom-classes": "text-sm font-medium text-white underline-offset-4 hover:underline",
              }, ["Website"]),
            ]),
          ]),
        ]),
      ]),
    ],
  },
} as const satisfies PageTemplateDefinition
