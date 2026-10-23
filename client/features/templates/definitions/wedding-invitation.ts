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

export const weddingInvitationTemplate = {
  schema: "livepage-template",
  version: 1,
  id: "wedding-invitation",
  metadata: {
    name: "Wedding Invitation",
    description: "An elegant wedding invitation page with couple names, date and venue, ceremony details, and an RSVP call to action.",
    category: "Event",
    tags: ["wedding", "invitation", "event", "rsvp", "celebration", "linkedin import"],
    thumbnail: "/template-thumbnails/wedding-invitation.svg",
  },
  dataMapping: {
    source: "linkedin-profile",
    fields: [
      {
        source: "name",
        description: "Shown as the couple's names in the hero.",
        targets: [{ componentId: "wedding-couple-names", kind: "text", field: "children" }],
      },
      {
        source: "headline",
        description: "Shown as the wedding date in the hero.",
        targets: [{ componentId: "wedding-date", kind: "text", field: "children" }],
      },
      {
        source: "summary",
        description: "Shown as the invitation message.",
        targets: [{ componentId: "wedding-message", kind: "text", field: "children" }],
      },
      {
        source: "location",
        description: "Shown as the venue.",
        targets: [{ componentId: "wedding-venue", kind: "text", field: "children" }],
      },
    ],
  },
  content: {
    pages: [
      node("page", "wedding-page", {
        title: "Alex & Jordan — Wedding Invitation",
        "custom-classes": "border-0 bg-[#faf8f5] text-[#3d2e2a] shadow-none",
      }, [
        node("column", "wedding-shell", { gap: "0", "custom-classes": "mx-auto w-full max-w-3xl", "margin-left": "auto", "margin-right": "auto" }, [
          node("column", "wedding-hero", {
            "padding-top": "4rem", "padding-right": "2rem", "padding-bottom": "3rem", "padding-left": "2rem",
            "gap": "1.5rem", "align-items": "center",
            "custom-classes": "text-center",
          }, [
            text("badge", "wedding-badge", "You're Invited", {
              variant: "outline",
              "custom-classes": "w-fit rounded-full border-[#d4c4b0] px-3 py-1 text-xs font-semibold tracking-wider text-[#6b5344]",
            }),
            text("header1", "wedding-couple-names", "Alex & Jordan", {
              "custom-classes": "py-0 text-5xl font-serif font-light leading-tight text-[#3d2e2a]",
            }),
            text("header2", "wedding-date", "Saturday, June 14, 2026", {
              "custom-classes": "py-0 text-2xl font-medium text-[#6b5344]",
            }),
            text("paragraph", "wedding-message", "We joyfully invite you to celebrate our marriage. Join us for an evening of love, laughter, and dancing under the stars.", {
              "custom-classes": "py-0 max-w-xl text-lg leading-relaxed text-[#5a463c]",
            }),
          ]),
          node("column", "wedding-details", {
            "padding-top": "2rem", "padding-right": "2rem", "padding-bottom": "3rem", "padding-left": "2rem",
            "gap": "2rem", "align-items": "center",
          }, [
            text("header3", "wedding-details-heading", "Ceremony & Reception", {
              "custom-classes": "py-0 text-xl font-semibold text-[#3d2e2a]",
            }),
            text("paragraph", "wedding-venue", "The Garden Pavilion at Willow Creek Estate\n123 Blossom Lane, Portland, OR", {
              "custom-classes": "py-0 text-center text-base leading-7 text-[#5a463c]",
            }),
            text("paragraph", "wedding-time", "Ceremony at 4:00 PM · Reception to follow", {
              "custom-classes": "py-0 text-sm text-[#6b5344]",
            }),
            node("button", "wedding-rsvp", {
              variant: "default",
              size: "lg",
              "custom-classes": "mt-4 rounded-full bg-[#6b5344] px-8 hover:bg-[#5a463c]",
            }, ["RSVP Now"]),
          ]),
        ]),
      ]),
    ],
  },
} as const satisfies PageTemplateDefinition
