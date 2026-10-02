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

export const agencyHomepageTemplate = {
  schema: "livepage-template",
  version: 1,
  id: "agency-homepage",
  metadata: {
    name: "Business / Agency Homepage",
    description: "A homepage for a studio or agency, covering services, process, case studies, and a project inquiry CTA.",
    category: "Business",
    tags: ["agency", "business", "studio", "services", "linkedin import"],
    thumbnail: "/template-thumbnails/agency-homepage.svg",
  },
  dataMapping: {
    source: "linkedin-profile",
    fields: [
      {
        source: "name",
        description: "Founder/agency name reused as the brand name in the nav and hero.",
        targets: [{ componentId: "agency-nav-brand", kind: "text", field: "children" }],
      },
      {
        source: "headline",
        description: "Reused as the hero tagline describing what the agency does.",
        targets: [{ componentId: "agency-hero-headline", kind: "text", field: "children" }],
      },
      {
        source: "summary",
        description: "Reused as the agency's about/positioning copy.",
        targets: [{ componentId: "agency-hero-copy", kind: "text", field: "children" }],
      },
      {
        source: "skills",
        description: "Reused directly as the list of services offered.",
        repeatable: true,
        targets: [{ componentId: "agency-services-list", kind: "attribute", field: "children[]" }],
      },
      {
        source: "positions",
        description: "Repeatable entries reinterpreted as case studies: position title becomes the client/project name and its highlights become the result summary.",
        repeatable: true,
        targets: [{ componentId: "agency-work-list", kind: "attribute", field: "children[]" }],
      },
      {
        source: "email, phone, location",
        description: "Primary contact details shown in the closing inquiry section.",
        targets: [{ componentId: "agency-contact-primary", kind: "text", field: "children" }],
      },
    ],
  },
  content: {
    pages: [
      node("page", "agency-homepage-template-page", {
        title: "Fieldwork Studio",
        "custom-classes": "border-0 bg-white shadow-none",
      }, [
        node("column", "agency-shell", {
          "gap": "0",
          "custom-classes": "mx-auto w-full",
        }, [
          node("row", "agency-nav", {
            "padding-top": "1.5rem", "padding-right": "2.5rem", "padding-bottom": "1.5rem", "padding-left": "2.5rem",
            "child-sizing": "natural", "align-items": "center", "justify-content": "between",
            "margin-left": "auto",
            "margin-right": "auto",
            "custom-classes": "mx-auto w-full max-w-6xl",
          }, [
            text("inline-text", "agency-nav-brand", "Fieldwork Studio", { "custom-classes": "text-lg font-semibold tracking-[-0.02em] text-slate-900" }),
            node("link", "agency-nav-cta", { href: "#contact", "custom-classes": "inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" }, ["Start a project"]),
          ]),
          node("column", "agency-hero", {
            "padding-top": "3rem", "padding-right": "2.5rem", "padding-bottom": "4rem", "padding-left": "2.5rem",
            "gap": "1.5rem",
            "margin-left": "auto",
            "margin-right": "auto",
            "custom-classes": "mx-auto w-full max-w-4xl bg-[#f6f5f2]",
          }, [
            text("header1", "agency-hero-headline", "A small studio building brands and products for growing companies.", {
              "custom-classes": "py-0 max-w-3xl text-5xl font-semibold leading-tight tracking-[-0.03em] text-slate-900",
            }),
            text("paragraph", "agency-hero-copy", "We partner with founders and marketing teams end to end — strategy, identity, and the product design that makes it real.", {
              "custom-classes": "max-w-xl py-0 text-lg leading-8 text-slate-600",
            }),
            node("row", "agency-hero-clients", {
              "padding-top": "0.5rem", "child-sizing": "natural", "align-items": "center", "gap": "1.5rem",
              "custom-classes": "flex-wrap",
            }, [
              text("inline-text", "agency-client-1", "NORTHWAY", { "custom-classes": "text-sm font-semibold tracking-[0.08em] text-slate-400" }),
              text("inline-text", "agency-client-2", "CEDAR & CO", { "custom-classes": "text-sm font-semibold tracking-[0.08em] text-slate-400" }),
              text("inline-text", "agency-client-3", "ORBITAL", { "custom-classes": "text-sm font-semibold tracking-[0.08em] text-slate-400" }),
              text("inline-text", "agency-client-4", "HARLOW", { "custom-classes": "text-sm font-semibold tracking-[0.08em] text-slate-400" }),
            ]),
          ]),
          node("column", "agency-services-section", {
            id: "services",
            "padding-top": "3rem", "padding-right": "2.5rem", "padding-bottom": "3rem", "padding-left": "2.5rem",
            "gap": "1.5rem",
            "margin-left": "auto",
            "margin-right": "auto",
            "custom-classes": "mx-auto w-full max-w-5xl",
          }, [
            text("header2", "agency-services-heading", "What we do", { "custom-classes": "py-0 text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-slate-500" }),
            node("row", "agency-services-list", {
              wrap: "wrap",
              "gap": "1rem",
            }, [
              text("badge", "agency-service-1", "Brand strategy", { variant: "secondary", "custom-classes": "rounded-full px-4 py-2 text-sm" }),
              text("badge", "agency-service-2", "Visual identity", { variant: "secondary", "custom-classes": "rounded-full px-4 py-2 text-sm" }),
              text("badge", "agency-service-3", "Web & product design", { variant: "secondary", "custom-classes": "rounded-full px-4 py-2 text-sm" }),
              text("badge", "agency-service-4", "Front-end development", { variant: "secondary", "custom-classes": "rounded-full px-4 py-2 text-sm" }),
            ]),
          ]),
          node("column", "agency-process-section", {
            "padding-top": "1rem", "padding-right": "2.5rem", "padding-bottom": "3rem", "padding-left": "2.5rem",
            "gap": "1.5rem",
            "margin-left": "auto",
            "margin-right": "auto",
            "custom-classes": "mx-auto w-full max-w-5xl",
          }, [
            text("header2", "agency-process-heading", "How we work", { "custom-classes": "py-0 text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-slate-500" }),
            node("row", "agency-process-list", { wrap: "wrap", "gap": "1.25rem", }, [
              node("column", "agency-process-1", { "gap": "0.5rem", "custom-classes": "min-w-0 flex-1" }, [
                text("inline-text", "agency-process-1-index", "01", { "custom-classes": "text-sm font-semibold text-slate-400" }),
                text("header3", "agency-process-1-title", "Discover", { "custom-classes": "py-0 text-lg font-semibold text-slate-900" }),
                text("paragraph", "agency-process-1-copy", "Workshops and research to align on goals, audience, and constraints before anything gets designed.", { "custom-classes": "py-0 text-sm leading-6 text-slate-600" }),
              ]),
              node("column", "agency-process-2", { "gap": "0.5rem", "custom-classes": "min-w-0 flex-1" }, [
                text("inline-text", "agency-process-2-index", "02", { "custom-classes": "text-sm font-semibold text-slate-400" }),
                text("header3", "agency-process-2-title", "Design", { "custom-classes": "py-0 text-lg font-semibold text-slate-900" }),
                text("paragraph", "agency-process-2-copy", "Rapid iteration in the open, with weekly reviews so there are no surprises at the end.", { "custom-classes": "py-0 text-sm leading-6 text-slate-600" }),
              ]),
              node("column", "agency-process-3", { "gap": "0.5rem", "custom-classes": "min-w-0 flex-1" }, [
                text("inline-text", "agency-process-3-index", "03", { "custom-classes": "text-sm font-semibold text-slate-400" }),
                text("header3", "agency-process-3-title", "Ship", { "custom-classes": "py-0 text-lg font-semibold text-slate-900" }),
                text("paragraph", "agency-process-3-copy", "We hand off production-ready files and code, and stay on for launch support.", { "custom-classes": "py-0 text-sm leading-6 text-slate-600" }),
              ]),
            ]),
          ]),
          node("divider", "agency-divider-1", { color: "#e2e8f0", style: "solid" }),
          node("column", "agency-work-section", {
            id: "work",
            "padding-top": "3rem", "padding-right": "2.5rem", "padding-bottom": "3rem", "padding-left": "2.5rem",
            "gap": "1.5rem",
            "margin-left": "auto",
            "margin-right": "auto",
            "custom-classes": "mx-auto w-full max-w-5xl",
          }, [
            text("header2", "agency-work-heading", "Recent work", { "custom-classes": "py-0 text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-slate-500" }),
            node("column", "agency-work-list", { "gap": "1rem" }, [
              node("row", "agency-work-1", {
                "padding-top": "1.25rem", "padding-right": "1.25rem", "padding-bottom": "1.25rem", "padding-left": "1.25rem",
                "child-sizing": "natural", "align-items": "baseline", "justify-content": "between",
                "custom-classes": "rounded-2xl border border-slate-200 bg-slate-50",
              }, [
                node("column", "agency-work-1-copy", { "gap": "0.25rem" }, [
                  text("header3", "agency-work-1-title", "Northway — brand relaunch", { "custom-classes": "py-0 text-lg font-semibold text-slate-900" }),
                  text("paragraph", "agency-work-1-result", "New identity and site drove a 40% lift in inbound demo requests within one quarter.", { "custom-classes": "py-0 text-sm leading-6 text-slate-600" }),
                ]),
                text("badge", "agency-work-1-tag", "Branding", { variant: "outline" }),
              ]),
              node("row", "agency-work-2", {
                "padding-top": "1.25rem", "padding-right": "1.25rem", "padding-bottom": "1.25rem", "padding-left": "1.25rem",
                "child-sizing": "natural", "align-items": "baseline", "justify-content": "between",
                "custom-classes": "rounded-2xl border border-slate-200 bg-slate-50",
              }, [
                node("column", "agency-work-2-copy", { "gap": "0.25rem" }, [
                  text("header3", "agency-work-2-title", "Cedar & Co — product redesign", { "custom-classes": "py-0 text-lg font-semibold text-slate-900" }),
                  text("paragraph", "agency-work-2-result", "Simplified checkout flow reduced cart abandonment by 18%.", { "custom-classes": "py-0 text-sm leading-6 text-slate-600" }),
                ]),
                text("badge", "agency-work-2-tag", "Product design", { variant: "outline" }),
              ]),
            ]),
          ]),
          node("column", "agency-contact-section", {
            id: "contact",
            "padding-top": "3rem", "padding-right": "2.5rem", "padding-bottom": "4rem", "padding-left": "2.5rem",
            "gap": "1rem",
            "align-items": "center",
            "margin-left": "auto",
            "margin-right": "auto",
            "custom-classes": "mx-auto w-full max-w-3xl rounded-[2rem] bg-slate-900 text-center text-white",
          }, [
            text("header2", "agency-contact-heading", "Have a project in mind?", { "custom-classes": "py-0 text-3xl font-semibold text-white" }),
            text("paragraph", "agency-contact-primary", "hello@example.com • Based in Chicago, IL • Taking on 2 new projects this quarter", { "custom-classes": "py-0 text-sm text-slate-300" }),
            node("button", "agency-contact-cta", { variant: "secondary", size: "lg", "custom-classes": "rounded-full px-6" }, ["Start a project"]),
          ]),
        ]),
      ]),
    ],
  },
} as const satisfies PageTemplateDefinition
