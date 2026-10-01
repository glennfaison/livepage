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
  return { tag, attributes: { id, ...attributes }, children } as const
}

const text = (
  tag: "header1" | "header2" | "header3" | "paragraph" | "badge" | "button" | "callout" | "inline-text",
  id: string,
  content: string,
  attributes: Readonly<Record<string, string>> = {},
) => node(tag, id, attributes, [content])

export const contactAboutPageTemplate = {
  schema: "livepage-template",
  version: 1,
  id: "contact-about-page",
  metadata: {
    name: "Contact / About",
    description: "A friendly about-and-contact page with quick facts, an FAQ, and clear ways to get in touch.",
    category: "Contact/About",
    tags: ["about", "contact", "faq", "personal website", "linkedin import"],
    thumbnail: "/template-thumbnails/contact-about-page.svg",
  },
  dataMapping: {
    source: "linkedin-profile",
    fields: [
      {
        source: "name",
        description: "Primary profile name shown in the hero heading.",
        targets: [{ componentId: "contact-hero-name", kind: "text", field: "children" }],
      },
      {
        source: "headline",
        description: "Professional headline shown beneath the hero heading.",
        targets: [{ componentId: "contact-hero-headline", kind: "text", field: "children" }],
      },
      {
        source: "summary",
        description: "Profile summary used as the about-section copy.",
        targets: [{ componentId: "contact-about-copy", kind: "text", field: "children" }],
      },
      {
        source: "profilePhotoUrl",
        description: "Profile photo used for the hero portrait.",
        targets: [{ componentId: "contact-hero-photo", kind: "attribute", field: "src" }],
      },
      {
        source: "email, phone, location",
        description: "Primary contact details shown in the contact card.",
        targets: [{ componentId: "contact-card-primary", kind: "text", field: "children" }],
      },
      {
        source: "linkedinUrl, githubUrl, websiteUrl",
        description: "Public profile links shown in the contact card.",
        targets: [{ componentId: "contact-card-links", kind: "attribute", field: "children[]" }],
      },
    ],
  },
  content: {
    pages: [
      node("page", "contact-about-template-page", {
        title: "About & Contact — Riley Ortiz",
        "custom-classes": "border-0 bg-white shadow-none",
      }, [
        node("row", "contact-shell", {
          "padding-top": "3rem", "padding-right": "2rem", "padding-bottom": "3rem", "padding-left": "2rem",
          "gap": "2.5rem",
          "custom-classes": "mx-auto w-full max-w-5xl items-start flex-wrap md:flex-nowrap",
        }, [
          node("column", "contact-main", {
            "gap": "2rem",
            "custom-classes": "min-w-0 flex-1",
          }, [
            node("row", "contact-hero", {
              "child-sizing": "natural", "align-items": "center", "gap": "1.25rem",
            }, [
              node("image", "contact-hero-photo", {
                alt: "Riley Ortiz portrait placeholder",
                src: "",
                fallbackSrc: "/placeholder-img.svg?height=200&width=200",
                width: "88px",
                height: "88px",
                objectFit: "cover",
                borderRadius: "9999px",
                loading: "lazy",
                decoding: "async",
                "custom-classes": "overflow-hidden rounded-full border border-slate-200 bg-slate-100",
              }),
              node("column", "contact-hero-copy", { "gap": "0.25rem" }, [
                text("header1", "contact-hero-name", "Riley Ortiz", { "custom-classes": "py-0 text-4xl font-semibold tracking-[-0.02em] text-slate-900" }),
                text("paragraph", "contact-hero-headline", "Freelance UX researcher helping teams talk to their users more often.", { "custom-classes": "py-0 text-base text-slate-500" }),
              ]),
            ]),
            text("paragraph", "contact-about-copy", "I've spent the last six years helping product teams replace assumptions with evidence — running interviews, usability tests, and surveys that actually change roadmaps. I work with a handful of teams at a time so every engagement gets real attention.", {
              "custom-classes": "py-0 max-w-xl text-[1.02rem] leading-8 text-slate-600",
            }),
            node("row", "contact-quick-facts", { "gap": "1rem", "custom-classes": "flex-wrap md:flex-nowrap" }, [
              node("column", "contact-fact-col-1", { "custom-classes": "min-w-0 flex-1" }, [
                node("stat", "contact-fact-1", { value: "< 24h", "custom-classes": "rounded-2xl border border-slate-200 bg-slate-50 shadow-none" }, ["Typical response time"]),
              ]),
              node("column", "contact-fact-col-2", { "custom-classes": "min-w-0 flex-1" }, [
                node("stat", "contact-fact-2", { value: "3", "custom-classes": "rounded-2xl border border-slate-200 bg-slate-50 shadow-none" }, ["Active client slots"]),
              ]),
              node("column", "contact-fact-col-3", { "custom-classes": "min-w-0 flex-1" }, [
                node("stat", "contact-fact-3", { value: "PST", "custom-classes": "rounded-2xl border border-slate-200 bg-slate-50 shadow-none" }, ["Based & working hours"]),
              ]),
            ]),
            node("divider", "contact-divider-1", { color: "#e2e8f0", style: "solid" }),
            node("column", "contact-faq-section", { "gap": "1.25rem" }, [
              text("header2", "contact-faq-heading", "Frequently asked", { "custom-classes": "py-0 text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-slate-500" }),
              node("column", "contact-faq-1", { "gap": "0.25rem" }, [
                text("header3", "contact-faq-1-question", "What kind of projects do you take on?", { "custom-classes": "py-0 text-base font-semibold text-slate-900" }),
                text("paragraph", "contact-faq-1-answer", "Mostly research sprints and ongoing research retainers for product and design teams at seed-to-series-B companies.", { "custom-classes": "py-0 text-sm leading-6 text-slate-600" }),
              ]),
              node("column", "contact-faq-2", { "gap": "0.25rem" }, [
                text("header3", "contact-faq-2-question", "How far in advance should I reach out?", { "custom-classes": "py-0 text-base font-semibold text-slate-900" }),
                text("paragraph", "contact-faq-2-answer", "2–3 weeks is ideal so we can scope the study properly, but reach out even if your timeline is tighter.", { "custom-classes": "py-0 text-sm leading-6 text-slate-600" }),
              ]),
              node("column", "contact-faq-3", { "gap": "0.25rem" }, [
                text("header3", "contact-faq-3-question", "Do you work with remote teams?", { "custom-classes": "py-0 text-base font-semibold text-slate-900" }),
                text("paragraph", "contact-faq-3-answer", "Yes — most of my engagements are fully remote, with occasional in-person sessions when it helps the research.", { "custom-classes": "py-0 text-sm leading-6 text-slate-600" }),
              ]),
            ]),
          ]),
          node("column", "contact-sidebar", {
            "padding-top": "1.75rem", "padding-right": "1.75rem", "padding-bottom": "1.75rem", "padding-left": "1.75rem",
            "gap": "1rem",
            "custom-classes": "basis-[19rem] flex-none rounded-3xl border border-slate-200 bg-slate-50 xl:sticky xl:top-8",
          }, [
            text("header3", "contact-card-heading", "Get in touch", { "custom-classes": "py-0 text-lg font-semibold text-slate-900" }),
            text("paragraph", "contact-card-primary", "riley@example.com • +1 (555) 987-6543 • Seattle, WA", { "custom-classes": "py-0 text-sm leading-6 text-slate-600" }),
            node("button", "contact-card-cta", { variant: "default", size: "default", "custom-classes": "w-full rounded-full" }, ["Send an email"]),
            node("divider", "contact-sidebar-divider", { color: "#e2e8f0", style: "solid" }),
            text("inline-text", "contact-card-links-heading", "ELSEWHERE", { "custom-classes": "text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400" }),
            node("column", "contact-card-links", { "gap": "0.5rem" }, [
              node("link", "contact-card-link-linkedin", { href: "https://linkedin.com", target: "_blank", "custom-classes": "text-sm font-medium text-slate-700 underline-offset-4 hover:underline" }, ["LinkedIn"]),
              node("link", "contact-card-link-github", { href: "https://github.com", target: "_blank", "custom-classes": "text-sm font-medium text-slate-700 underline-offset-4 hover:underline" }, ["GitHub"]),
              node("link", "contact-card-link-website", { href: "https://example.com", target: "_blank", "custom-classes": "text-sm font-medium text-slate-700 underline-offset-4 hover:underline" }, ["Portfolio"]),
            ]),
          ]),
        ]),
      ]),
    ],
  },
} as const satisfies PageTemplateDefinition
