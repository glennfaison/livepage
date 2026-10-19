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

export const realEstatePropertyTemplate = {
  schema: "livepage-template",
  version: 1,
  id: "real-estate-property",
  metadata: {
    name: "Real Estate Property",
    description: "A property listing page with a hero photo, price and key details, a photo gallery, a listing agent card, and a seller contact section.",
    category: "Real Estate",
    tags: ["real estate", "property", "listing", "home for sale", "linkedin import"],
    thumbnail: "/template-thumbnails/real-estate-property.svg",
  },
  dataMapping: {
    source: "linkedin-profile",
    fields: [
      {
        source: "name",
        description: "Shown as the property title in the hero and browser tab.",
        targets: [{ componentId: "property-heading", kind: "text", field: "children" }],
      },
      {
        source: "headline",
        description: "Shown as the asking price in the hero price row.",
        targets: [{ componentId: "property-price", kind: "text", field: "children" }],
      },
      {
        source: "summary",
        description: "Shown as the property description under the details heading.",
        targets: [{ componentId: "property-description", kind: "text", field: "children" }],
      },
      {
        source: "positions",
        description: "Repeatable work history reinterpreted as property features.",
        repeatable: true,
        targets: [{ componentId: "property-features-list", kind: "attribute", field: "children[]" }],
      },
      {
        source: "skills",
        description: "Repeatable skills reinterpreted as the amenities tag list.",
        repeatable: true,
        targets: [{ componentId: "property-amenities-list", kind: "attribute", field: "children[]" }],
      },
      {
        source: "email",
        description: "Shown as the seller contact mailto link.",
        targets: [{ componentId: "property-contact-email", kind: "attribute", field: "href" }],
      },
    ],
  },
  content: {
    pages: [
      node("page", "real-estate-page", {
        title: "18 Willow Lane — Property Listing",
        "custom-classes": "border-0 bg-white shadow-none",
      }, [
        node("column", "property-shell", { gap: "0", "custom-classes": "mx-auto w-full" }, [
          node("row", "property-nav", {
            "padding-top": "1.5rem", "padding-right": "2.5rem", "padding-bottom": "1.5rem", "padding-left": "2.5rem",
            "child-sizing": "natural", "align-items": "center", "justify-content": "between",
            "custom-classes": "flex-wrap border-b border-[#e2e8f0] bg-white",
          }, [
            text("inline-text", "property-brand", "Willow & Vine Realty", {
              "custom-classes": "text-lg font-semibold tracking-[-0.02em] text-slate-900",
            }),
            node("row", "property-nav-actions", {
              "child-sizing": "natural", "align-items": "center", "gap": "1rem",
              "custom-classes": "ml-auto",
            }, [
              node("link", "property-nav-details", { href: "#details", "custom-classes": "text-sm font-medium text-slate-600 hover:text-slate-900" }, ["Details"]),
              node("link", "property-nav-agent", { href: "#agent", "custom-classes": "text-sm font-medium text-slate-600 hover:text-slate-900" }, ["Agent"]),
              node("button", "property-nav-tour", { variant: "default", size: "sm", "custom-classes": "rounded-full" }, ["Schedule tour"]),
            ]),
          ]),
          node("column", "property-hero", {
            "padding-top": "3rem", "padding-right": "2.5rem", "padding-bottom": "4rem", "padding-left": "2.5rem",
            "gap": "1.5rem", "align-items": "center",
            "custom-classes": "bg-slate-50",
          }, [
            text("badge", "property-hero-badge", "For Sale", {
              variant: "outline",
              "custom-classes": "w-fit rounded-full px-3 py-1 text-xs font-semibold text-slate-900",
            }),
            text("header1", "property-heading", "18 Willow Lane", {
              "custom-classes": "py-0 text-5xl font-semibold leading-tight tracking-[-0.03em] text-slate-900",
            }),
            text("inline-text", "property-location", "Portland, OR 97205", {
              "custom-classes": "py-0 text-lg text-slate-600",
            }),
            node("row", "property-price-row", {
              "child-sizing": "natural", "align-items": "center", "gap": "0.75rem",
              "custom-classes": "flex-wrap",
            }, [
              text("header2", "property-price", "$875,000", {
                "custom-classes": "py-0 text-3xl font-semibold text-slate-900",
              }),
              text("badge", "property-status-badge", "Active", {
                variant: "secondary",
                "custom-classes": "w-fit rounded-full px-3 py-1 text-xs font-semibold text-indigo-700",
              }),
            ]),
            text("paragraph", "property-tagline", "A light-filled Craftsman bungalow with original hardwood floors, a renovated kitchen, and a private garden patio.", {
              "custom-classes": "max-w-xl py-0 text-base leading-7 text-slate-600",
            }),
            node("image", "property-hero-art", {
              src: "",
              fallbackSrc: "/template-art/real-estate-property-hero.svg",
              alt: "Exterior of a Craftsman bungalow with a front porch and garden",
              width: "100%", height: "auto", objectFit: "cover", borderRadius: "24px",
              "custom-classes": "min-w-0 flex-1 basis-[22rem] shadow-[0_20px_45px_rgba(15,23,42,0.10)]",
            }),
          ]),
          node("row", "property-stat-row", {
            wrap: "wrap",
            "padding-top": "0", "padding-right": "2.5rem", "padding-bottom": "3rem", "padding-left": "2.5rem",
            "gap": "1rem",
            "custom-classes": "mx-auto w-full max-w-5xl",
          }, [
            node("column", "property-stat-col-1", { "custom-classes": "min-w-0 flex-1" }, [
              node("stat", "property-stat-beds", { value: "3", "custom-classes": "rounded-2xl border border-slate-200 bg-slate-50 shadow-none" }, ["Bedrooms"]),
            ]),
            node("column", "property-stat-col-2", { "custom-classes": "min-w-0 flex-1" }, [
              node("stat", "property-stat-baths", { value: "2", "custom-classes": "rounded-2xl border border-slate-200 bg-slate-50 shadow-none" }, ["Bathrooms"]),
            ]),
            node("column", "property-stat-col-3", { "custom-classes": "min-w-0 flex-1" }, [
              node("stat", "property-stat-sqft", { value: "1,950 sq ft", "custom-classes": "rounded-2xl border border-slate-200 bg-slate-50 shadow-none" }, ["Interior"]),
            ]),
            node("column", "property-stat-col-4", { "custom-classes": "min-w-0 flex-1" }, [
              node("stat", "property-stat-lot", { value: "0.28 acre", "custom-classes": "rounded-2xl border border-slate-200 bg-slate-50 shadow-none" }, ["Lot"]),
            ]),
          ]),
          node("column", "property-details-section", {
            id: "details",
            "padding-top": "3rem", "padding-right": "2.5rem", "padding-bottom": "3rem", "padding-left": "2.5rem",
            "gap": "2rem",
            "custom-classes": "mx-auto w-full max-w-5xl",
          }, [
            node("column", "property-details-heading-group", { "gap": "0.75rem", "align-items": "center", "custom-classes": "text-center" }, [
              text("header2", "property-details-heading", "Property details", { "custom-classes": "py-0 text-3xl font-semibold text-slate-900" }),
              text("paragraph", "property-description", "This beautifully maintained bungalow combines original character with modern updates throughout, from the refinished hardwood floors to the chef-ready kitchen and landscaped backyard.", { "custom-classes": "max-w-xl py-0 text-base text-slate-600" }),
            ]),
            node("row", "property-features-list", {
              wrap: "wrap", "gap": "1.25rem",
              "custom-classes": "flex-wrap",
            }, []),
            node("row", "property-amenities-list", {
              wrap: "wrap", "gap": "1rem",
              "custom-classes": "flex-wrap",
            }, []),
          ]),
          node("row", "property-gallery-row", {
            wrap: "wrap", "gap": "1rem",
            "padding-top": "0", "padding-right": "2.5rem", "padding-bottom": "3rem", "padding-left": "2.5rem",
            "custom-classes": "mx-auto w-full max-w-5xl",
          }, [
            node("image", "property-gallery-1", { src: "", fallbackSrc: "/template-art/real-estate-property-kitchen.svg", alt: "Renovated kitchen", width: "100%", height: "auto", objectFit: "cover", borderRadius: "16px", "custom-classes": "min-w-0 flex-1 basis-[16rem] aspect-[4/3]" }),
            node("image", "property-gallery-2", { src: "", fallbackSrc: "/template-art/real-estate-property-living.svg", alt: "Living room", width: "100%", height: "auto", objectFit: "cover", borderRadius: "16px", "custom-classes": "min-w-0 flex-1 basis-[16rem] aspect-[4/3]" }),
            node("image", "property-gallery-3", { src: "", fallbackSrc: "/template-art/real-estate-property-bedroom.svg", alt: "Primary bedroom", width: "100%", height: "auto", objectFit: "cover", borderRadius: "16px", "custom-classes": "min-w-0 flex-1 basis-[16rem] aspect-[4/3]" }),
            node("image", "property-gallery-4", { src: "", fallbackSrc: "/template-art/real-estate-property-garden.svg", alt: "Backyard garden", width: "100%", height: "auto", objectFit: "cover", borderRadius: "16px", "custom-classes": "min-w-0 flex-1 basis-[16rem] aspect-[4/3]" }),
          ]),
          node("column", "property-agent-section", {
            id: "agent",
            "padding-top": "0", "padding-right": "2.5rem", "padding-bottom": "3.5rem", "padding-left": "2.5rem",
            "gap": "1.5rem",
            "custom-classes": "mx-auto w-full max-w-5xl",
          }, [
            node("column", "property-agent-heading-group", { "gap": "0.75rem", "align-items": "center", "custom-classes": "text-center" }, [
              text("header2", "property-agent-heading", "Listing agent", { "custom-classes": "py-0 text-3xl font-semibold text-slate-900" }),
              text("paragraph", "property-agent-copy", "Questions or ready to schedule a viewing? Get in touch with the listing agent.", { "custom-classes": "max-w-xl py-0 text-base text-slate-600" }),
            ]),
            node("row", "property-agent-card", {
              "child-sizing": "natural", "align-items": "start", "gap": "1.5rem",
              "custom-classes": "flex-wrap rounded-3xl border border-slate-200 bg-white shadow-sm",
            }, [
              node("image", "property-agent-photo", { src: "", fallbackSrc: "/template-art/real-estate-property-agent.svg", alt: "Listing agent portrait", width: "96px", height: "96px", objectFit: "cover", borderRadius: "9999px", "custom-classes": "shrink-0" }),
              node("column", "property-agent-info", { gap: "0.5rem", "padding-top": "0.5rem" }, [
                text("header3", "property-agent-name", "Jordan Ellis", { "custom-classes": "py-0 text-lg font-semibold text-slate-900" }),
                text("paragraph", "property-agent-role", "Willow & Vine Realty", { "custom-classes": "py-0 text-sm text-slate-600" }),
                text("inline-text", "property-agent-phone", "(503) 555-0148", { "custom-classes": "py-0 text-sm text-slate-600" }),
                node("link", "property-contact-email", { href: "mailto:jordan@example.com", "custom-classes": "text-sm font-medium text-indigo-600 hover:underline" }, ["jordan@example.com"]),
              ]),
            ]),
            node("row", "property-contact-actions", {
              "child-sizing": "natural", "justify-content": "center", "gap": "0.75rem",
              "padding-top": "1rem",
              "custom-classes": "flex-wrap",
            }, [
              node("button", "property-tour-cta", { variant: "default", size: "lg", "custom-classes": "rounded-full px-6" }, ["Schedule a viewing"]),
            ]),
          ]),
          node("row", "property-footer", {
            "child-sizing": "natural", "align-items": "center", "justify-content": "between", "gap": "1rem",
            "padding-top": "1.25rem", "padding-right": "2.5rem", "padding-bottom": "1.25rem", "padding-left": "2.5rem",
            "custom-classes": "[&>*]:!self-center flex-wrap border-t border-[#e2e8f0] text-xs text-slate-500",
          }, [
            text("inline-text", "property-footer-brand", "WILLOW & VINE REALTY · LISTING DETAILS", { "custom-classes": "font-semibold tracking-[0.08em]" }),
            node("divider", "property-footer-divider", { color: "#e2e8f0", style: "solid" }),
            node("link", "property-footer-equal-housing", { href: "#", "custom-classes": "text-slate-500 hover:text-slate-700" }, ["Equal housing opportunity"]),
          ]),
        ]),
      ]),
    ],
  },
} as const satisfies PageTemplateDefinition
