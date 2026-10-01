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

export const eventConferencePageTemplate = {
  schema: "livepage-template",
  version: 1,
  id: "event-conference-page",
  metadata: {
    name: "Event / Conference",
    description: "A one-page event site with a hero, speaker lineup, schedule, and ticket tiers.",
    category: "Event",
    tags: ["event", "conference", "meetup", "tickets", "linkedin import"],
    thumbnail: "/template-thumbnails/event-conference-page.svg",
  },
  dataMapping: {
    source: "linkedin-profile",
    fields: [
      {
        source: "name",
        description: "Reused as the event name in the nav and hero.",
        targets: [{ componentId: "event-hero-name", kind: "text", field: "children" }],
      },
      {
        source: "headline",
        description: "Reused as the event date/location line beneath the event name.",
        targets: [{ componentId: "event-hero-when-where", kind: "text", field: "children" }],
      },
      {
        source: "summary",
        description: "Reused as the event's short description.",
        targets: [{ componentId: "event-about-copy", kind: "text", field: "children" }],
      },
      {
        source: "positions",
        description: "Repeatable entries reinterpreted as featured speakers: position title becomes the speaker's name and role, and its highlights become their talk abstract.",
        repeatable: true,
        targets: [{ componentId: "event-speakers-list", kind: "attribute", field: "children[]" }],
      },
      {
        source: "skills",
        description: "Reused as the list of session tracks/topics.",
        repeatable: true,
        targets: [{ componentId: "event-tracks-list", kind: "attribute", field: "children[]" }],
      },
      {
        source: "email",
        description: "Organizer contact link shown in the footer.",
        targets: [{ componentId: "event-footer-contact", kind: "attribute", field: "href" }],
      },
    ],
  },
  content: {
    pages: [
      node("page", "event-conference-template-page", {
        title: "Signal Conf 2027",
        "custom-classes": "border-0 bg-[#0b1017] text-slate-100 shadow-none",
      }, [
        node("column", "event-shell", {
          "gap": "0",
          "custom-classes": "mx-auto w-full",
        }, [
          node("row", "event-nav", {
            "padding-top": "1.5rem", "padding-right": "2.5rem", "padding-bottom": "1.5rem", "padding-left": "2.5rem",
            "child-sizing": "natural", "align-items": "center", "justify-content": "between",
            "custom-classes": "mx-auto w-full max-w-6xl border-b border-slate-800",
          }, [
            text("inline-text", "event-nav-brand", "SIGNAL CONF", { "custom-classes": "font-mono text-sm font-semibold tracking-[0.14em] text-slate-100" }),
            node("button", "event-nav-cta", { variant: "default", size: "sm", "custom-classes": "rounded-full bg-cyan-400 text-slate-900 hover:bg-cyan-300" }, ["Get tickets"]),
          ]),
          node("column", "event-hero", {
            "padding-top": "4rem", "padding-right": "2.5rem", "padding-bottom": "4rem", "padding-left": "2.5rem",
            "gap": "1.25rem", "align-items": "center",
            "custom-classes": "mx-auto w-full max-w-3xl text-center",
          }, [
            text("badge", "event-hero-badge", "3 days · 40+ sessions", { variant: "secondary", "custom-classes": "w-fit rounded-full px-3 py-1 text-xs font-semibold" }),
            text("header1", "event-hero-name", "Signal Conf", { "custom-classes": "py-0 text-6xl font-semibold tracking-[-0.04em] text-slate-100" }),
            text("paragraph", "event-hero-when-where", "March 10–12, 2027 · Austin Convention Center", { "custom-classes": "py-0 text-lg text-cyan-300" }),
            text("paragraph", "event-about-copy", "The gathering for engineers and product leaders building the next generation of real-time systems. Talks, workshops, and hallway conversations that actually matter.", { "custom-classes": "max-w-xl py-0 text-base leading-7 text-slate-400" }),
            node("row", "event-hero-actions", { "child-sizing": "natural", "align-items": "center", "justify-content": "center", "gap": "0.75rem" }, [
              node("button", "event-hero-cta-primary", { variant: "default", size: "lg", "custom-classes": "rounded-full bg-cyan-400 px-6 text-slate-900 hover:bg-cyan-300" }, ["Get tickets"]),
              node("link", "event-hero-cta-secondary", { href: "#schedule", "custom-classes": "inline-flex items-center rounded-full border border-slate-700 px-6 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800" }, ["View schedule"]),
            ]),
          ]),
          node("row", "event-stat-row", {
            "padding-top": "0", "padding-right": "2.5rem", "padding-bottom": "3rem", "padding-left": "2.5rem",
            "gap": "1rem",
            "custom-classes": "mx-auto w-full max-w-4xl flex-wrap md:flex-nowrap",
          }, [
            node("column", "event-stat-col-1", { "custom-classes": "min-w-0 flex-1" }, [
              node("stat", "event-stat-1", { value: "3", "custom-classes": "rounded-2xl border border-slate-800 bg-slate-900 shadow-none" }, ["Days"]),
            ]),
            node("column", "event-stat-col-2", { "custom-classes": "min-w-0 flex-1" }, [
              node("stat", "event-stat-2", { value: "40+", "custom-classes": "rounded-2xl border border-slate-800 bg-slate-900 shadow-none" }, ["Sessions"]),
            ]),
            node("column", "event-stat-col-3", { "custom-classes": "min-w-0 flex-1" }, [
              node("stat", "event-stat-3", { value: "1,800", "custom-classes": "rounded-2xl border border-slate-800 bg-slate-900 shadow-none" }, ["Attendees last year"]),
            ]),
          ]),
          node("column", "event-speakers-section", {
            id: "speakers",
            "padding-top": "1rem", "padding-right": "2.5rem", "padding-bottom": "3rem", "padding-left": "2.5rem",
            "gap": "1.5rem",
            "custom-classes": "mx-auto w-full max-w-5xl border-t border-slate-800",
          }, [
            text("header2", "event-speakers-heading", "Featured speakers", { "custom-classes": "py-0 pt-6 text-xl font-semibold text-slate-100" }),
            node("row", "event-speakers-list", { "gap": "1.25rem", "custom-classes": "flex-wrap md:flex-nowrap" }, [
              node("column", "event-speaker-1", { "gap": "0.5rem", "custom-classes": "min-w-0 flex-1 rounded-2xl border border-slate-800 bg-slate-900 p-5" }, [
                text("header3", "event-speaker-1-name", "Jordan Lee — VP Engineering, Northstar", { "custom-classes": "py-0 text-base font-semibold text-slate-100" }),
                text("paragraph", "event-speaker-1-talk", "Scaling real-time infrastructure past a billion daily events without losing your weekends.", { "custom-classes": "py-0 text-sm leading-6 text-slate-400" }),
              ]),
              node("column", "event-speaker-2", { "gap": "0.5rem", "custom-classes": "min-w-0 flex-1 rounded-2xl border border-slate-800 bg-slate-900 p-5" }, [
                text("header3", "event-speaker-2-name", "Amara Osei — Staff Engineer, Cloudline", { "custom-classes": "py-0 text-base font-semibold text-slate-100" }),
                text("paragraph", "event-speaker-2-talk", "Designing APIs that survive five years of change without a single breaking release.", { "custom-classes": "py-0 text-sm leading-6 text-slate-400" }),
              ]),
              node("column", "event-speaker-3", { "gap": "0.5rem", "custom-classes": "min-w-0 flex-1 rounded-2xl border border-slate-800 bg-slate-900 p-5" }, [
                text("header3", "event-speaker-3-name", "Diego Fuentes — CTO, Fieldnote", { "custom-classes": "py-0 text-base font-semibold text-slate-100" }),
                text("paragraph", "event-speaker-3-talk", "What we got wrong migrating a monolith to event-driven services, and what we'd do again.", { "custom-classes": "py-0 text-sm leading-6 text-slate-400" }),
              ]),
            ]),
            node("column", "event-tracks-list", { "custom-classes": "flex-row flex-wrap items-center gap-2 pt-2" }, [
              text("badge", "event-track-1", "Distributed systems", { variant: "outline" }),
              text("badge", "event-track-2", "API design", { variant: "outline" }),
              text("badge", "event-track-3", "Platform engineering", { variant: "outline" }),
              text("badge", "event-track-4", "Developer experience", { variant: "outline" }),
            ]),
          ]),
          node("column", "event-schedule-section", {
            id: "schedule",
            "padding-top": "1rem", "padding-right": "2.5rem", "padding-bottom": "3rem", "padding-left": "2.5rem",
            "gap": "1rem",
            "custom-classes": "mx-auto w-full max-w-3xl border-t border-slate-800",
          }, [
            text("header2", "event-schedule-heading", "Day one at a glance", { "custom-classes": "py-0 pt-6 text-xl font-semibold text-slate-100" }),
            node("row", "event-schedule-item-1", { "child-sizing": "natural", "align-items": "baseline", "gap": "1rem" }, [
              node("time", "event-schedule-item-1-time", { dateTime: "2027-03-10T09:00:00-05:00" }, ["Registration & coffee"]),
            ]),
            node("row", "event-schedule-item-2", { "child-sizing": "natural", "align-items": "baseline", "gap": "1rem" }, [
              node("time", "event-schedule-item-2-time", { dateTime: "2027-03-10T10:00:00-05:00" }, ["Opening keynote"]),
            ]),
            node("row", "event-schedule-item-3", { "child-sizing": "natural", "align-items": "baseline", "gap": "1rem" }, [
              node("time", "event-schedule-item-3-time", { dateTime: "2027-03-10T13:00:00-05:00" }, ["Breakout sessions begin"]),
            ]),
          ]),
          node("row", "event-tickets-section", {
            "padding-top": "1rem", "padding-right": "2.5rem", "padding-bottom": "4rem", "padding-left": "2.5rem",
            "gap": "1.25rem",
            "custom-classes": "mx-auto w-full max-w-5xl border-t border-slate-800 flex-wrap md:flex-nowrap",
          }, [
            node("column", "event-ticket-early", {
              "padding-top": "2rem", "padding-right": "1.5rem", "padding-bottom": "2rem", "padding-left": "1.5rem",
              "gap": "0.75rem",
              "custom-classes": "min-w-0 flex-1 rounded-2xl border border-slate-800 bg-slate-900",
            }, [
              text("header3", "event-ticket-early-title", "Early bird", { "custom-classes": "py-0 text-sm font-semibold uppercase tracking-[0.12em] text-slate-400" }),
              text("header2", "event-ticket-early-amount", "$299", { "custom-classes": "py-0 text-2xl font-semibold text-slate-100" }),
              node("button", "event-ticket-early-cta", { variant: "outline", size: "default", "custom-classes": "w-full rounded-full" }, ["Reserve a seat"]),
            ]),
            node("column", "event-ticket-standard", {
              "padding-top": "2rem", "padding-right": "1.5rem", "padding-bottom": "2rem", "padding-left": "1.5rem",
              "gap": "0.75rem",
              "custom-classes": "min-w-0 flex-1 rounded-2xl border-2 border-cyan-400 bg-slate-900",
            }, [
              text("header3", "event-ticket-standard-title", "Standard", { "custom-classes": "py-0 text-sm font-semibold uppercase tracking-[0.12em] text-slate-400" }),
              text("header2", "event-ticket-standard-amount", "$449", { "custom-classes": "py-0 text-2xl font-semibold text-slate-100" }),
              node("button", "event-ticket-standard-cta", { variant: "default", size: "default", "custom-classes": "w-full rounded-full bg-cyan-400 text-slate-900 hover:bg-cyan-300" }, ["Get tickets"]),
            ]),
            node("column", "event-ticket-team", {
              "padding-top": "2rem", "padding-right": "1.5rem", "padding-bottom": "2rem", "padding-left": "1.5rem",
              "gap": "0.75rem",
              "custom-classes": "min-w-0 flex-1 rounded-2xl border border-slate-800 bg-slate-900",
            }, [
              text("header3", "event-ticket-team-title", "Team of 5", { "custom-classes": "py-0 text-sm font-semibold uppercase tracking-[0.12em] text-slate-400" }),
              text("header2", "event-ticket-team-amount", "$1,999", { "custom-classes": "py-0 text-2xl font-semibold text-slate-100" }),
              node("link", "event-footer-contact", { href: "mailto:hello@example.com", "custom-classes": "w-full text-center text-sm font-medium text-cyan-300 underline-offset-4 hover:underline" }, ["Contact the organizers"]),
            ]),
          ]),
        ]),
      ]),
    ],
  },
} as const satisfies PageTemplateDefinition
