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
  return { tag, attributes: { id, ...attributes }, children } as const
}

const text = (
  tag: "header1" | "header2" | "header3" | "paragraph" | "badge" | "button" | "callout" | "inline-text",
  id: string,
  content: string,
  attributes: Readonly<Record<string, string>> = {},
) => node(tag, id, attributes, [content])

export const landingPageSaasTemplate = {
  schema: "livepage-template",
  version: 1,
  id: "landing-page-saas",
  metadata: {
    name: "Landing Page / SaaS",
    description: "A conversion-focused product landing page with a hero, feature highlights, pricing, and a final CTA.",
    category: "Landing Page",
    tags: ["landing page", "saas", "product", "marketing", "linkedin import"],
    thumbnail: "/template-thumbnails/landing-page-saas.svg",
  },
  dataMapping: {
    source: "linkedin-profile",
    fields: [
      {
        source: "name",
        description: "Reused as the product/brand name in the nav and hero.",
        targets: [
          { componentId: "landing-nav-brand", kind: "text", field: "children" },
          { componentId: "landing-hero-brand-badge", kind: "text", field: "children" },
        ],
      },
      {
        source: "headline",
        description: "Reused as the hero tagline.",
        targets: [{ componentId: "landing-hero-headline", kind: "text", field: "children" }],
      },
      {
        source: "summary",
        description: "Reused as the hero supporting description.",
        targets: [{ componentId: "landing-hero-copy", kind: "text", field: "children" }],
      },
      {
        source: "positions",
        description: "Repeatable entries reinterpreted as feature highlights: position title becomes the feature name and its highlights become the feature description.",
        repeatable: true,
        targets: [
          { componentId: "landing-features-list", kind: "attribute", field: "children[]" },
        ],
      },
      {
        source: "skills",
        description: "Reused as the integrations/works-with tag list.",
        repeatable: true,
        targets: [
          { componentId: "landing-integrations-list", kind: "attribute", field: "children[]" },
        ],
      },
      {
        source: "email",
        description: "Reused as the footer contact link.",
        targets: [{ componentId: "landing-footer-contact", kind: "attribute", field: "href" }],
      },
    ],
  },
  content: {
    pages: [
      node("page", "landing-saas-page", {
        title: "Flowline — Landing Page",
        "custom-classes": "border-0 bg-white shadow-none",
      }, [
        node("column", "landing-shell", {
          "gap": "0",
          "custom-classes": "mx-auto w-full",
        }, [
          node("row", "landing-nav", {
            "padding-top": "1.5rem",
            "padding-right": "2.5rem",
            "padding-bottom": "1.5rem",
            "padding-left": "2.5rem",
            "child-sizing": "natural",
            "align-items": "center",
            "justify-content": "between",
            "custom-classes": "mx-auto w-full max-w-6xl",
          }, [
            text("inline-text", "landing-nav-brand", "Flowline", {
              "custom-classes": "text-lg font-semibold tracking-[-0.02em] text-slate-900",
            }),
            node("row", "landing-nav-actions", {
              "child-sizing": "natural",
              "align-items": "center",
              "gap": "1rem",
            }, [
              node("link", "landing-nav-login", { href: "#login", "custom-classes": "text-sm font-medium text-slate-600 hover:text-slate-900" }, ["Log in"]),
              node("button", "landing-nav-cta", { variant: "default", size: "sm", "custom-classes": "rounded-full" }, ["Start free trial"]),
            ]),
          ]),
          node("column", "landing-hero", {
            "padding-top": "3rem",
            "padding-right": "2.5rem",
            "padding-bottom": "4rem",
            "padding-left": "2.5rem",
            "gap": "1.5rem",
            "align-items": "center",
            "custom-classes": "mx-auto w-full max-w-3xl text-center bg-gradient-to-b from-indigo-50 to-white",
          }, [
            text("badge", "landing-hero-brand-badge", "Flowline 2.0 is here", {
              variant: "secondary",
              "custom-classes": "w-fit rounded-full px-3 py-1 text-xs font-semibold text-indigo-700",
            }),
            text("header1", "landing-hero-headline", "Ship customer workflows without writing glue code.", {
              "custom-classes": "py-0 text-5xl font-semibold leading-tight tracking-[-0.03em] text-slate-900",
            }),
            text("paragraph", "landing-hero-copy", "Flowline connects your product, support, and billing tools into one automation layer, so your team spends less time stitching APIs and more time shipping.", {
              "custom-classes": "max-w-xl py-0 text-lg leading-8 text-slate-600",
            }),
            node("row", "landing-hero-actions", {
              "child-sizing": "natural",
              "align-items": "center",
              "justify-content": "center",
              "gap": "0.75rem",
            }, [
              node("button", "landing-hero-cta-primary", { variant: "default", size: "lg", "custom-classes": "rounded-full px-6" }, ["Start free trial"]),
              node("link", "landing-hero-cta-secondary", { href: "#demo", "custom-classes": "inline-flex items-center rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50" }, ["Watch 2-min demo"]),
            ]),
            text("inline-text", "landing-hero-microcopy", "No credit card required · Cancel anytime", {
              "custom-classes": "text-xs text-slate-400",
            }),
          ]),
          node("row", "landing-stat-row", {
            "padding-top": "0",
            "padding-right": "2.5rem",
            "padding-bottom": "3rem",
            "padding-left": "2.5rem",
            "gap": "1rem",
            "custom-classes": "mx-auto w-full max-w-5xl flex-wrap md:flex-nowrap",
          }, [
            node("column", "landing-stat-col-1", { "custom-classes": "min-w-0 flex-1" }, [
              node("stat", "landing-stat-1", { value: "4,200+", "custom-classes": "rounded-2xl border border-slate-200 bg-slate-50 shadow-none" }, ["Teams automating workflows"]),
            ]),
            node("column", "landing-stat-col-2", { "custom-classes": "min-w-0 flex-1" }, [
              node("stat", "landing-stat-2", { value: "18M", "custom-classes": "rounded-2xl border border-slate-200 bg-slate-50 shadow-none" }, ["Workflow runs per month"]),
            ]),
            node("column", "landing-stat-col-3", { "custom-classes": "min-w-0 flex-1" }, [
              node("stat", "landing-stat-3", { value: "99.98%", "custom-classes": "rounded-2xl border border-slate-200 bg-slate-50 shadow-none" }, ["Uptime over the last year"]),
            ]),
          ]),
          node("column", "landing-features-section", {
            id: "features",
            "padding-top": "3rem",
            "padding-right": "2.5rem",
            "padding-bottom": "3rem",
            "padding-left": "2.5rem",
            "gap": "2rem",
            "custom-classes": "mx-auto w-full max-w-5xl",
          }, [
            node("column", "landing-features-heading-group", { "gap": "0.75rem", "align-items": "center", "custom-classes": "text-center" }, [
              text("header2", "landing-features-heading", "Everything your team needs to automate the busywork", {
                "custom-classes": "py-0 text-3xl font-semibold text-slate-900",
              }),
              text("paragraph", "landing-features-subheading", "Purpose-built blocks for the workflows that used to live in spreadsheets and Slack threads.", {
                "custom-classes": "max-w-xl py-0 text-base text-slate-500",
              }),
            ]),
            node("row", "landing-features-list", {
              "gap": "1.25rem",
              "custom-classes": "flex-wrap md:flex-nowrap",
            }, [
              node("column", "landing-feature-1", {
                "padding-top": "1.5rem", "padding-right": "1.5rem", "padding-bottom": "1.5rem", "padding-left": "1.5rem",
                "gap": "0.5rem",
                "custom-classes": "min-w-0 flex-1 rounded-3xl border border-slate-200 bg-white",
              }, [
                text("header3", "landing-feature-1-title", "Visual workflow builder", { "custom-classes": "py-0 text-lg font-semibold text-slate-900" }),
                text("paragraph", "landing-feature-1-copy", "Drag-and-drop triggers, conditions, and actions across every tool you already use — no code required.", { "custom-classes": "py-0 text-sm leading-6 text-slate-600" }),
              ]),
              node("column", "landing-feature-2", {
                "padding-top": "1.5rem", "padding-right": "1.5rem", "padding-bottom": "1.5rem", "padding-left": "1.5rem",
                "gap": "0.5rem",
                "custom-classes": "min-w-0 flex-1 rounded-3xl border border-slate-200 bg-white",
              }, [
                text("header3", "landing-feature-2-title", "Real-time monitoring", { "custom-classes": "py-0 text-lg font-semibold text-slate-900" }),
                text("paragraph", "landing-feature-2-copy", "Catch failed runs before your customers do, with alerts routed straight to Slack or PagerDuty.", { "custom-classes": "py-0 text-sm leading-6 text-slate-600" }),
              ]),
              node("column", "landing-feature-3", {
                "padding-top": "1.5rem", "padding-right": "1.5rem", "padding-bottom": "1.5rem", "padding-left": "1.5rem",
                "gap": "0.5rem",
                "custom-classes": "min-w-0 flex-1 rounded-3xl border border-slate-200 bg-white",
              }, [
                text("header3", "landing-feature-3-title", "Enterprise-grade access", { "custom-classes": "py-0 text-lg font-semibold text-slate-900" }),
                text("paragraph", "landing-feature-3-copy", "SSO, audit logs, and granular permissions so security teams sign off without slowing you down.", { "custom-classes": "py-0 text-sm leading-6 text-slate-600" }),
              ]),
            ]),
            node("column", "landing-integrations-section", { "gap": "0.75rem", "align-items": "center", "custom-classes": "text-center" }, [
              text("inline-text", "landing-integrations-heading", "WORKS WITH THE TOOLS YOU ALREADY USE", {
                "custom-classes": "text-xs font-semibold uppercase tracking-[0.16em] text-slate-400",
              }),
              node("column", "landing-integrations-list", {
                "custom-classes": "flex-row flex-wrap items-center justify-center gap-2",
              }, [
                text("badge", "landing-integration-1", "Slack", { variant: "outline" }),
                text("badge", "landing-integration-2", "Salesforce", { variant: "outline" }),
                text("badge", "landing-integration-3", "Stripe", { variant: "outline" }),
                text("badge", "landing-integration-4", "Zendesk", { variant: "outline" }),
                text("badge", "landing-integration-5", "HubSpot", { variant: "outline" }),
              ]),
            ]),
          ]),
          node("divider", "landing-divider-1", { color: "#e2e8f0", style: "solid" }),
          node("row", "landing-pricing-section", {
            id: "pricing",
            "padding-top": "3rem",
            "padding-right": "2.5rem",
            "padding-bottom": "3rem",
            "padding-left": "2.5rem",
            "gap": "1.25rem",
            "custom-classes": "mx-auto w-full max-w-5xl flex-wrap md:flex-nowrap",
          }, [
            node("column", "landing-price-starter", {
              "padding-top": "2rem", "padding-right": "1.75rem", "padding-bottom": "2rem", "padding-left": "1.75rem",
              "gap": "1rem",
              "custom-classes": "min-w-0 flex-1 rounded-3xl border border-slate-200 bg-white",
            }, [
              text("header3", "landing-price-starter-title", "Starter", { "custom-classes": "py-0 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500" }),
              text("header2", "landing-price-starter-amount", "$0/mo", { "custom-classes": "py-0 text-3xl font-semibold text-slate-900" }),
              text("paragraph", "landing-price-starter-copy", "For solo builders trying Flowline on a first project.", { "custom-classes": "py-0 text-sm text-slate-500" }),
              node("button", "landing-price-starter-cta", { variant: "outline", size: "default", "custom-classes": "w-full rounded-full" }, ["Get started"]),
            ]),
            node("column", "landing-price-team", {
              "padding-top": "2rem", "padding-right": "1.75rem", "padding-bottom": "2rem", "padding-left": "1.75rem",
              "gap": "1rem",
              "custom-classes": "min-w-0 flex-1 rounded-3xl border-2 border-slate-900 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]",
            }, [
              text("badge", "landing-price-team-badge", "Most popular", { variant: "default", "custom-classes": "w-fit rounded-full" }),
              text("header3", "landing-price-team-title", "Team", { "custom-classes": "py-0 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500" }),
              text("header2", "landing-price-team-amount", "$49/mo", { "custom-classes": "py-0 text-3xl font-semibold text-slate-900" }),
              text("paragraph", "landing-price-team-copy", "For growing teams automating customer-facing workflows.", { "custom-classes": "py-0 text-sm text-slate-500" }),
              node("button", "landing-price-team-cta", { variant: "default", size: "default", "custom-classes": "w-full rounded-full" }, ["Start free trial"]),
            ]),
            node("column", "landing-price-enterprise", {
              "padding-top": "2rem", "padding-right": "1.75rem", "padding-bottom": "2rem", "padding-left": "1.75rem",
              "gap": "1rem",
              "custom-classes": "min-w-0 flex-1 rounded-3xl border border-slate-200 bg-white",
            }, [
              text("header3", "landing-price-enterprise-title", "Enterprise", { "custom-classes": "py-0 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500" }),
              text("header2", "landing-price-enterprise-amount", "Custom", { "custom-classes": "py-0 text-3xl font-semibold text-slate-900" }),
              text("paragraph", "landing-price-enterprise-copy", "For organizations with dedicated security and compliance needs.", { "custom-classes": "py-0 text-sm text-slate-500" }),
              node("button", "landing-price-enterprise-cta", { variant: "outline", size: "default", "custom-classes": "w-full rounded-full" }, ["Talk to sales"]),
            ]),
          ]),
          node("column", "landing-final-cta", {
            "padding-top": "3rem",
            "padding-right": "2.5rem",
            "padding-bottom": "3.5rem",
            "padding-left": "2.5rem",
            "gap": "1rem",
            "align-items": "center",
            "custom-classes": "mx-auto w-full max-w-4xl rounded-[2rem] bg-slate-900 text-center text-white",
          }, [
            text("header2", "landing-final-cta-heading", "Automate your first workflow in under 10 minutes.", {
              "custom-classes": "py-0 text-3xl font-semibold text-white",
            }),
            node("row", "landing-final-cta-actions", { "child-sizing": "natural", "align-items": "center", "gap": "0.75rem" }, [
              node("button", "landing-final-cta-primary", { variant: "secondary", size: "lg", "custom-classes": "rounded-full px-6" }, ["Start free trial"]),
              node("link", "landing-footer-contact", { href: "mailto:hello@example.com", "custom-classes": "text-sm font-medium text-slate-300 underline-offset-4 hover:underline" }, ["Or talk to our team"]),
            ]),
          ]),
        ]),
      ]),
    ],
  },
} as const satisfies PageTemplateDefinition
