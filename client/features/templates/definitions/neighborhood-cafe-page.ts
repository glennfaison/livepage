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

function menuItem(id: string, name: string, description: string, price: string): TemplateNode {
  return node("column", id, {
    gap: "0.75rem",
    "padding-top": "1.5rem",
    "padding-right": "1.5rem",
    "padding-bottom": "1.5rem",
    "padding-left": "1.5rem",
    "custom-classes": "min-w-0 flex-1 basis-[14rem] rounded-2xl border border-[#eadfce] bg-white",
  }, [
    text("badge", `${id}-label`, "SEASONAL FAVORITE", {
      variant: "outline",
      "custom-classes": "w-fit rounded-full border-[#dec8a7] text-[10px] font-semibold tracking-[0.12em] text-[#815c37]",
    }),
    text("header3", `${id}-name`, name, {
      "custom-classes": "py-0 text-xl font-semibold text-[#38291f]",
    }),
    text("paragraph", `${id}-description`, description, {
      "custom-classes": "py-0 text-sm leading-6 text-[#746255]",
    }),
    text("inline-text", `${id}-price`, price, {
      "custom-classes": "mt-auto text-sm font-semibold text-[#9a572f]",
    }),
  ])
}

export const neighborhoodCafePageTemplate = {
  schema: "livepage-template",
  version: 1,
  id: "neighborhood-cafe-page",
  metadata: {
    name: "Neighborhood Café",
    description: "A welcoming café website with a signature coffee hero, seasonal menu, owner story, and clear hours and location.",
    category: "Restaurant",
    tags: ["cafe", "coffee shop", "restaurant", "menu", "local business", "linkedin import"],
    thumbnail: "/template-thumbnails/neighborhood-cafe-page.svg",
  },
  dataMapping: {
    source: "linkedin-profile",
    fields: [
      {
        source: "name",
        description: "The founder's name shown in the café story.",
        targets: [{ componentId: "cafe-owner-name", kind: "text", field: "children" }],
      },
      {
        source: "headline",
        description: "The founder's role shown beneath their name in the café story.",
        targets: [{ componentId: "cafe-owner-role", kind: "text", field: "children" }],
      },
      {
        source: "summary",
        description: "The founder's story and the café's neighborhood mission.",
        targets: [{ componentId: "cafe-story-copy", kind: "text", field: "children" }],
      },
    ],
  },
  content: {
    pages: [
      node("page", "cafe-page", {
        title: "Juniper & Grain — Neighborhood Café",
        "custom-classes": "border-0 bg-[#faf7f0] text-[#38291f] shadow-none",
      }, [
        node("column", "cafe-shell", { gap: "0", "custom-classes": "mx-auto w-full" }, [
          node("row", "cafe-nav", {
            "child-sizing": "natural",
            "align-items": "center",
            "justify-content": "between",
            gap: "1rem",
            "padding-top": "1.25rem",
            "padding-right": "2.5rem",
            "padding-bottom": "1.25rem",
            "padding-left": "2.5rem",
            "custom-classes": "[&>*]:!self-center flex-wrap border-b border-[#eadfce] bg-[#faf7f0]",
          }, [
            text("inline-text", "cafe-brand", "JUNIPER & GRAIN", {
              "custom-classes": "text-sm font-bold tracking-[0.16em] text-[#67442f]",
            }),
            node("row", "cafe-nav-links", {
              "child-sizing": "natural",
              "align-items": "center",
              gap: "1.25rem",
              "custom-classes": "[&>*]:!self-center ml-auto",
            }, [
              node("link", "cafe-nav-menu", { href: "#cafe-menu", "custom-classes": "text-sm font-medium text-[#67442f] hover:text-[#9a572f]" }, ["Menu"]),
              node("link", "cafe-nav-visit", { href: "#cafe-visit", "custom-classes": "text-sm font-medium text-[#67442f] hover:text-[#9a572f]" }, ["Visit"]),
              node("link", "cafe-nav-order", {
                href: "https://example.com",
                "custom-classes": "rounded-full bg-[#67442f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#503522]",
              }, ["Order ahead"]),
            ]),
          ]),
          node("row", "cafe-hero", {
            "child-sizing": "natural",
            wrap: "wrap",
            gap: "2rem",
            "align-items": "center",
            "padding-top": "3.5rem",
            "padding-right": "2.5rem",
            "padding-bottom": "3.5rem",
            "padding-left": "2.5rem",
            "custom-classes": "min-h-[32rem]",
          }, [
            node("column", "cafe-hero-content", {
              gap: "1.25rem",
              "custom-classes": "min-w-0 flex-1 basis-[20rem]",
            }, [
              text("badge", "cafe-hero-badge", "COFFEE, BAKED FRESH, CLOSE TO HOME", {
                variant: "outline",
                "custom-classes": "w-fit rounded-full border-[#dec8a7] bg-[#f3ead9] px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-[#815c37]",
              }),
              text("header1", "cafe-hero-heading", "A little ritual, right around the corner.", {
                "custom-classes": "py-0 text-5xl font-semibold leading-[1.05] tracking-[-0.045em] text-[#38291f] md:text-6xl",
              }),
              text("paragraph", "cafe-hero-copy", "Slow mornings start here. Stop by for thoughtfully sourced coffee, warm-from-the-oven pastries, and a seat saved for you.", {
                "custom-classes": "max-w-xl py-0 text-base leading-7 text-[#746255]",
              }),
              node("row", "cafe-hero-actions", {
                "child-sizing": "natural",
                "align-items": "center",
                gap: "0.75rem",
                "custom-classes": "[&>*]:!self-end flex-wrap",
              }, [
                node("link", "cafe-hero-menu-link", {
                  href: "#cafe-menu",
                  "custom-classes": "rounded-full bg-[#9a572f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#804623]",
                }, ["Explore the menu"]),
                node("link", "cafe-hero-location-link", {
                  href: "#cafe-visit",
                  "custom-classes": "rounded-full border border-[#dec8a7] px-6 py-3 text-sm font-semibold text-[#67442f] hover:bg-[#f3ead9]",
                }, ["Find us"]),
              ]),
              text("inline-text", "cafe-hero-note", "OPEN DAILY · 7 AM – 4 PM", {
                "custom-classes": "pt-2 text-xs font-semibold tracking-[0.12em] text-[#815c37]",
              }),
            ]),
            node("image", "cafe-hero-art", {
              src: "",
              fallbackSrc: "/template-art/neighborhood-cafe-hero.svg",
              alt: "Illustration of a cappuccino, fresh pastry, and a leafy café plant",
              width: "100%",
              height: "auto",
              objectFit: "cover",
              borderRadius: "24px",
              "custom-classes": "min-w-0 flex-1 basis-[20rem] shadow-[0_20px_45px_rgba(82,56,37,0.14)]",
            }),
          ]),
          node("column", "cafe-menu-section", {
            id: "cafe-menu",
            gap: "1.5rem",
            "padding-top": "3rem",
            "padding-right": "2.5rem",
            "padding-bottom": "3.5rem",
            "padding-left": "2.5rem",
            "custom-classes": "border-y border-[#eadfce] bg-[#f3ead9]",
          }, [
            node("row", "cafe-menu-intro", {
              "child-sizing": "natural",
              "align-items": "end",
              "justify-content": "between",
              gap: "1.5rem",
              "custom-classes": "[&>*]:!self-center flex-wrap",
            }, [
              node("column", "cafe-menu-heading-group", { gap: "0.5rem", "custom-classes": "min-w-0" }, [
                text("inline-text", "cafe-menu-eyebrow", "MADE HERE, WITH CARE", {
                  "custom-classes": "text-xs font-semibold tracking-[0.14em] text-[#9a572f]",
                }),
                text("header2", "cafe-menu-heading", "This season, at the counter", {
                  "custom-classes": "py-0 text-3xl font-semibold tracking-[-0.03em] text-[#38291f]",
                }),
              ]),
              text("paragraph", "cafe-menu-caption", "Local harvests, familiar comforts.", {
                "custom-classes": "py-0 text-sm text-[#746255]",
              }),
            ]),
            node("row", "cafe-menu-items", {
              "child-sizing": "natural",
              wrap: "wrap",
              gap: "1.25rem",
              "align-items": "stretch",
            }, [
              menuItem("cafe-menu-latte", "Maple oat latte", "Double espresso, silky oat milk, Oregon maple, and cinnamon.", "$5.50"),
              menuItem("cafe-menu-croissant", "Pear & ginger danish", "Flaky morning pastry layered with market pears and candied ginger.", "$4.75"),
              menuItem("cafe-menu-toast", "Autumn squash toast", "Roasted delicata, whipped ricotta, market greens, and sourdough.", "$9.00"),
            ]),
          ]),
          node("row", "cafe-story-visit", {
            "child-sizing": "natural",
            wrap: "wrap",
            gap: "2rem",
            "padding-top": "3.5rem",
            "padding-right": "2.5rem",
            "padding-bottom": "3.5rem",
            "padding-left": "2.5rem",
          }, [
            node("column", "cafe-story", {
              gap: "1rem",
              "padding-top": "2rem",
              "padding-right": "2rem",
              "padding-bottom": "2rem",
              "padding-left": "2rem",
              "custom-classes": "min-w-0 flex-1 basis-[20rem] rounded-3xl bg-[#67442f] text-white",
            }, [
              text("inline-text", "cafe-story-eyebrow", "OUR LITTLE CORNER", {
                "custom-classes": "text-xs font-semibold tracking-[0.14em] text-[#e7c89f]",
              }),
              text("header2", "cafe-story-heading", "Rooted in the neighborhood.", {
                "custom-classes": "py-0 text-3xl font-semibold tracking-[-0.03em] text-white",
              }),
              text("paragraph", "cafe-story-copy", "Juniper & Grain began with a simple idea: make the kind of place where the barista knows your order and there is always room at the table. We work with nearby growers and bakers to bring a little more care to every cup.", {
                "custom-classes": "py-0 text-sm leading-7 text-[#f4e8d8]",
              }),
              node("column", "cafe-owner", { gap: "0.25rem", "padding-top": "0.5rem" }, [
                text("inline-text", "cafe-owner-name", "Maya Chen", {
                  "custom-classes": "text-sm font-semibold text-white",
                }),
                text("inline-text", "cafe-owner-role", "Founder & neighborhood regular", {
                  "custom-classes": "text-xs text-[#e7c89f]",
                }),
              ]),
            ]),
            node("column", "cafe-visit", {
              id: "cafe-visit",
              gap: "1.25rem",
              "padding-top": "1rem",
              "custom-classes": "min-w-0 flex-1 basis-[17rem]",
            }, [
              text("inline-text", "cafe-visit-eyebrow", "COME ON IN", {
                "custom-classes": "text-xs font-semibold tracking-[0.14em] text-[#9a572f]",
              }),
              text("header2", "cafe-visit-heading", "Your table is waiting.", {
                "custom-classes": "py-0 text-3xl font-semibold tracking-[-0.03em] text-[#38291f]",
              }),
              node("column", "cafe-visit-details", { gap: "1rem", "padding-top": "0.5rem" }, [
                node("column", "cafe-address", { gap: "0.25rem" }, [
                  text("inline-text", "cafe-address-label", "FIND US", {
                    "custom-classes": "text-[10px] font-semibold tracking-[0.12em] text-[#815c37]",
                  }),
                  text("paragraph", "cafe-address-copy", "18 Willow Lane\nPortland, OR 97205", {
                    "custom-classes": "whitespace-pre-line py-0 text-sm leading-6 text-[#746255]",
                  }),
                ]),
                node("column", "cafe-hours", { gap: "0.25rem" }, [
                  text("inline-text", "cafe-hours-label", "HOURS", {
                    "custom-classes": "text-[10px] font-semibold tracking-[0.12em] text-[#815c37]",
                  }),
                  text("paragraph", "cafe-hours-copy", "Every day · 7:00 am–4:00 pm", {
                    "custom-classes": "py-0 text-sm leading-6 text-[#746255]",
                  }),
                ]),
              ]),
              node("link", "cafe-visit-map-link", {
                href: "https://example.com",
                target: "_blank",
                "custom-classes": "w-fit rounded-full border border-[#dec8a7] px-5 py-2.5 text-sm font-semibold text-[#67442f] hover:bg-[#f3ead9]",
              }, ["Get directions"]),
            ]),
          ]),
          node("row", "cafe-footer", {
            "child-sizing": "natural",
            "align-items": "center",
            "justify-content": "between",
            gap: "1rem",
            "padding-top": "1.25rem",
            "padding-right": "2.5rem",
            "padding-bottom": "1.25rem",
            "padding-left": "2.5rem",
            "custom-classes": "[&>*]:!self-center flex-wrap border-t border-[#eadfce] text-xs text-[#815c37]",
          }, [
            text("inline-text", "cafe-footer-brand", "JUNIPER & GRAIN · GOOD THINGS, CLOSE TO HOME", {
              "custom-classes": "font-semibold tracking-[0.08em]",
            }),
            node("link", "cafe-footer-contact", {
              href: "mailto:hello@example.com",
              "custom-classes": "font-medium hover:text-[#9a572f]",
            }, ["Say hello"]),
          ]),
        ]),
      ]),
    ],
  },
} as const satisfies PageTemplateDefinition
