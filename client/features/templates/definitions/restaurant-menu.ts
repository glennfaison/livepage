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

export const restaurantMenuTemplate = {
  schema: "livepage-template",
  version: 1,
  id: "restaurant-menu",
  metadata: {
    name: "Restaurant Menu",
    description: "A warm, inviting restaurant menu page with a hero, featured dishes, full menu sections, hours, and a reservation call to action.",
    category: "Restaurant",
    tags: ["restaurant", "menu", "food", "dining", "reservation", "linkedin import"],
    thumbnail: "/template-thumbnails/restaurant-menu.svg",
  },
  dataMapping: {
    source: "linkedin-profile",
    fields: [
      {
        source: "name",
        description: "Shown as the restaurant name in the nav and hero.",
        targets: [
          { componentId: "restaurant-nav-brand", kind: "text", field: "children" },
          { componentId: "restaurant-hero-name", kind: "text", field: "children" },
        ],
      },
      {
        source: "headline",
        description: "Shown as the hero tagline.",
        targets: [{ componentId: "restaurant-hero-tagline", kind: "text", field: "children" }],
      },
      {
        source: "summary",
        description: "Shown as the restaurant description.",
        targets: [{ componentId: "restaurant-about-copy", kind: "text", field: "children" }],
      },
      {
        source: "positions",
        description: "Repeatable entries reinterpreted as featured dishes: position title becomes the dish name and highlights become the description.",
        repeatable: true,
        targets: [{ componentId: "restaurant-featured-list", kind: "attribute", field: "children[]" }],
      },
      {
        source: "skills",
        description: "Reused as dietary/accommodation tags.",
        repeatable: true,
        targets: [{ componentId: "restaurant-dietary-tags", kind: "attribute", field: "children[]" }],
      },
      {
        source: "email",
        description: "Reused as the reservation/contact link.",
        targets: [{ componentId: "restaurant-reserve-cta", kind: "attribute", field: "href" }],
      },
    ],
  },
  content: {
    pages: [
      node("page", "restaurant-menu-page", {
        title: "The Hearth & Grain — Menu",
        "custom-classes": "border-0 bg-[#f8f6f3] shadow-none",
      }, [
        node("column", "restaurant-shell", { gap: "0", "custom-classes": "mx-auto w-full" }, [
          node("row", "restaurant-nav", {
            "padding-top": "1.5rem", "padding-right": "2.5rem", "padding-bottom": "1.5rem", "padding-left": "2.5rem",
            "child-sizing": "natural", "align-items": "center", "justify-content": "between",
            "margin-left": "auto", "margin-right": "auto",
            "custom-classes": "mx-auto w-full max-w-6xl",
          }, [
            text("inline-text", "restaurant-nav-brand", "The Hearth & Grain", {
              "custom-classes": "text-lg font-semibold tracking-[-0.02em] text-[#3d2e2a]",
            }),
            node("row", "restaurant-nav-actions", {
              "child-sizing": "natural", "align-items": "center", "gap": "1rem",
            }, [
              node("link", "restaurant-nav-menu", { href: "#menu", "custom-classes": "text-sm font-medium text-[#6b5344] hover:text-[#3d2e2a]" }, ["Menu"]),
              node("link", "restaurant-nav-hours", { href: "#hours", "custom-classes": "text-sm font-medium text-[#6b5344] hover:text-[#3d2e2a]" }, ["Hours"]),
              node("button", "restaurant-nav-reserve", { variant: "default", size: "sm", "custom-classes": "rounded-full bg-[#6b5344] hover:bg-[#5a463c]" }, ["Reserve a table"]),
            ]),
          ]),
          node("column", "restaurant-hero", {
            "padding-top": "4rem", "padding-right": "2.5rem", "padding-bottom": "4rem", "padding-left": "2.5rem",
            "gap": "1.25rem", "align-items": "center",
            "margin-left": "auto", "margin-right": "auto",
            "custom-classes": "mx-auto w-full max-w-3xl text-center",
          }, [
            text("badge", "restaurant-hero-badge", "Farm-to-Table", {
              variant: "outline",
              "custom-classes": "w-fit rounded-full border-[#d4c4b0] px-3 py-1 text-xs font-semibold tracking-wider text-[#6b5344]",
            }),
            text("header1", "restaurant-hero-name", "The Hearth & Grain", {
              "custom-classes": "py-0 text-5xl font-serif font-light leading-tight text-[#3d2e2a]",
            }),
            text("header2", "restaurant-hero-tagline", "Wood-fired comfort food, locally sourced.", {
              "custom-classes": "py-0 text-xl font-medium text-[#6b5344]",
            }),
            text("paragraph", "restaurant-hero-copy", "Seasonal dishes crafted with love, from our hearth to your table.", {
              "custom-classes": "max-w-xl py-0 text-base leading-7 text-[#5a463c]",
            }),
          ]),
          node("column", "restaurant-about-section", {
            "padding-top": "2rem", "padding-right": "2.5rem", "padding-bottom": "3rem", "padding-left": "2.5rem",
            "gap": "1rem", "align-items": "center",
            "margin-left": "auto", "margin-right": "auto",
            "custom-classes": "mx-auto w-full max-w-3xl text-center",
          }, [
            text("header2", "restaurant-about-heading", "Our Story", {
              "custom-classes": "py-0 text-3xl font-serif font-light text-[#3d2e2a]",
            }),
            text("paragraph", "restaurant-about-copy", "We believe in honest ingredients, time-honored techniques, and warm hospitality. Our menu changes with the seasons to showcase the best of what our region has to offer.", {
              "custom-classes": "py-0 text-base leading-7 text-[#5a463c]",
            }),
            node("row", "restaurant-dietary-tags", {
              "custom-classes": "flex-row items-center justify-center gap-2",
              "wrap": "wrap",
            }, [
              text("badge", "restaurant-diet-1", "Vegetarian", { variant: "outline", "custom-classes": "rounded-full border-[#d4c4b0] px-3 py-1 text-[#6b5344]" }),
              text("badge", "restaurant-diet-2", "Gluten-Free Options", { variant: "outline", "custom-classes": "rounded-full border-[#d4c4b0] px-3 py-1 text-[#6b5344]" }),
              text("badge", "restaurant-diet-3", "Farm-Fresh", { variant: "outline", "custom-classes": "rounded-full border-[#d4c4b0] px-3 py-1 text-[#6b5344]" }),
            ]),
          ]),
          node("divider", "restaurant-divider-1", { color: "#d4c4b0", style: "solid" }),
          node("column", "restaurant-menu-section", {
            id: "menu",
            "padding-top": "3rem", "padding-right": "2.5rem", "padding-bottom": "3rem", "padding-left": "2.5rem",
            "gap": "2.5rem",
            "margin-left": "auto", "margin-right": "auto",
            "custom-classes": "mx-auto w-full max-w-4xl",
          }, [
            text("header2", "restaurant-menu-heading", "Menu", {
              "custom-classes": "py-0 text-center text-3xl font-serif font-light text-[#3d2e2a]",
            }),
            node("column", "restaurant-featured-section", { gap: "1.5rem" }, [
              text("header3", "restaurant-featured-heading", "Chef's Favorites", {
                "custom-classes": "py-0 text-xl font-semibold text-[#3d2e2a]",
              }),
              node("column", "restaurant-featured-list", { gap: "1rem" }, [
                node("row", "restaurant-featured-1", {
                  "align-items": "start", "justify-content": "between", "gap": "1rem",
                  "padding-bottom": "1rem",
                  "custom-classes": "border-b border-[#d4c4b0]/60",
                }, [
                  node("column", "restaurant-featured-1-info", { gap: "0.25rem" }, [
                    text("header3", "restaurant-featured-1-name", "Wood-Fired Ribeye", { "custom-classes": "py-0 text-lg font-semibold text-[#3d2e2a]" }),
                    text("paragraph", "restaurant-featured-1-desc", "Grass-fed, herb butter, roasted fingerlings, seasonal vegetables", { "custom-classes": "py-0 text-sm text-[#6b5344]" }),
                  ]),
                  text("inline-text", "restaurant-featured-1-price", "$42", { "custom-classes": "text-lg font-semibold text-[#3d2e2a]" }),
                ]),
                node("row", "restaurant-featured-2", {
                  "align-items": "start", "justify-content": "between", "gap": "1rem",
                  "padding-bottom": "1rem",
                  "custom-classes": "border-b border-[#d4c4b0]/60",
                }, [
                  node("column", "restaurant-featured-2-info", { gap: "0.25rem" }, [
                    text("header3", "restaurant-featured-2-name", "Mushroom & Leek Risotto", { "custom-classes": "py-0 text-lg font-semibold text-[#3d2e2a]" }),
                    text("paragraph", "restaurant-featured-2-desc", "Wild mushrooms, thyme, aged parmesan, truffle oil", { "custom-classes": "py-0 text-sm text-[#6b5344]" }),
                  ]),
                  text("inline-text", "restaurant-featured-2-price", "$28", { "custom-classes": "text-lg font-semibold text-[#3d2e2a]" }),
                ]),
              ]),
            ]),
            node("column", "restaurant-mains-section", { gap: "1.5rem" }, [
              text("header3", "restaurant-mains-heading", "Mains", {
                "custom-classes": "py-0 text-xl font-semibold text-[#3d2e2a]",
              }),
              node("column", "restaurant-mains-list", { gap: "1rem" }, [
                node("row", "restaurant-main-1", {
                  "align-items": "start", "justify-content": "between", "gap": "1rem",
                  "padding-bottom": "1rem",
                  "custom-classes": "border-b border-[#d4c4b0]/60",
                }, [
                  node("column", "restaurant-main-1-info", { gap: "0.25rem" }, [
                    text("header3", "restaurant-main-1-name", "Pan-Seared Salmon", { "custom-classes": "py-0 text-lg font-semibold text-[#3d2e2a]" }),
                    text("paragraph", "restaurant-main-1-desc", "Citrus beurre blanc, quinoa, rainbow carrots", { "custom-classes": "py-0 text-sm text-[#6b5344]" }),
                  ]),
                  text("inline-text", "restaurant-main-1-price", "$32", { "custom-classes": "text-lg font-semibold text-[#3d2e2a]" }),
                ]),
                node("row", "restaurant-main-2", {
                  "align-items": "start", "justify-content": "between", "gap": "1rem",
                  "padding-bottom": "1rem",
                  "custom-classes": "border-b border-[#d4c4b0]/60",
                }, [
                  node("column", "restaurant-main-2-info", { gap: "0.25rem" }, [
                    text("header3", "restaurant-main-2-name", "Herb-Roasted Chicken", { "custom-classes": "py-0 text-lg font-semibold text-[#3d2e2a]" }),
                    text("paragraph", "restaurant-main-2-desc", "Roasted garlic potatoes, braised greens, natural jus", { "custom-classes": "py-0 text-sm text-[#6b5344]" }),
                  ]),
                  text("inline-text", "restaurant-main-2-price", "$26", { "custom-classes": "text-lg font-semibold text-[#3d2e2a]" }),
                ]),
              ]),
            ]),
          ]),
          node("divider", "restaurant-divider-2", { color: "#d4c4b0", style: "solid" }),
          node("column", "restaurant-hours-section", {
            id: "hours",
            "padding-top": "3rem", "padding-right": "2.5rem", "padding-bottom": "3rem", "padding-left": "2.5rem",
            "gap": "1.5rem", "align-items": "center",
            "margin-left": "auto", "margin-right": "auto",
            "custom-classes": "mx-auto w-full max-w-3xl text-center",
          }, [
            text("header2", "restaurant-hours-heading", "Hours & Location", {
              "custom-classes": "py-0 text-3xl font-serif font-light text-[#3d2e2a]",
            }),
            node("column", "restaurant-hours-list", { gap: "0.5rem" }, [
              text("paragraph", "restaurant-hours-1", "Tuesday - Thursday: 5:00 PM - 9:00 PM", { "custom-classes": "py-0 text-base text-[#5a463c]" }),
              text("paragraph", "restaurant-hours-2", "Friday - Saturday: 5:00 PM - 10:00 PM", { "custom-classes": "py-0 text-base text-[#5a463c]" }),
              text("paragraph", "restaurant-hours-3", "Sunday: 4:00 PM - 8:00 PM", { "custom-classes": "py-0 text-base text-[#5a463c]" }),
              text("paragraph", "restaurant-hours-closed", "Closed Monday", { "custom-classes": "py-0 text-base text-[#6b5344]" }),
            ]),
            text("paragraph", "restaurant-location", "123 Market Street, Portland, OR 97205", {
              "custom-classes": "py-0 text-base text-[#5a463c]",
            }),
          ]),
          node("column", "restaurant-reserve-section", {
            "padding-top": "2rem", "padding-right": "2.5rem", "padding-bottom": "4rem", "padding-left": "2.5rem",
            "gap": "1rem", "align-items": "center",
            "margin-left": "auto", "margin-right": "auto",
            "custom-classes": "mx-auto w-full max-w-3xl text-center",
          }, [
            text("header2", "restaurant-reserve-heading", "Join Us", {
              "custom-classes": "py-0 text-3xl font-serif font-light text-[#3d2e2a]",
            }),
            text("paragraph", "restaurant-reserve-copy", "Reservations recommended. Walk-ins welcome when space allows.", {
              "custom-classes": "py-0 text-base text-[#5a463c]",
            }),
            node("button", "restaurant-reserve-cta", {
              variant: "default",
              size: "lg",
              href: "mailto:reservations@example.com",
              "custom-classes": "mt-2 rounded-full bg-[#6b5344] px-8 hover:bg-[#5a463c]",
            }, ["Make a Reservation"]),
          ]),
        ]),
      ]),
    ],
  },
} as const satisfies PageTemplateDefinition
