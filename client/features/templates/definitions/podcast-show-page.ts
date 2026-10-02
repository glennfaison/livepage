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

function episodeRow(id: string, episodeTitle: string, description: string, duration: string, guest: string, avatarSlug: string): TemplateNode {
  return node("row", id, {
    "child-sizing": "natural",
    "align-items": "center",
    gap: "1rem",
    "padding-top": "1rem",
    "padding-bottom": "1rem",
    "custom-classes": "[&>*]:!self-center border-b border-amber-100 last:border-b-0 flex-wrap",
  }, [
    node("image", `${id}-cover`, {
      src: "",
      fallbackSrc: `/avatars/${avatarSlug}.svg`,
      alt: `${guest} portrait`,
      width: "72px",
      height: "72px",
      borderRadius: "14px",
      objectFit: "cover",
      objectPosition: "center",
      "custom-classes": "shrink-0 ring-1 ring-amber-200",
    }),
    node("column", `${id}-body`, { gap: "0.25rem", "custom-classes": "min-w-0 basis-48 grow" }, [
      text("header3", `${id}-title`, episodeTitle, { "custom-classes": "py-0 text-base font-semibold text-amber-950" }),
      text("paragraph", `${id}-copy`, description, { "custom-classes": "py-0 text-sm leading-6 text-amber-900/70" }),
      text("inline-text", `${id}-duration`, duration, { "custom-classes": "font-mono text-[11px] uppercase tracking-[0.12em] text-amber-700" }),
    ]),
    node("link", `${id}-play`, {
      href: "#",
      "custom-classes": "shrink-0 ml-auto rounded-full border border-amber-300 px-4 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100",
    }, ["Listen"]),
  ])
}

export const podcastShowPageTemplate = {
  schema: "livepage-template",
  version: 1,
  id: "podcast-show-page",
  metadata: {
    name: "Podcast Show Page",
    description: "A warm, single-column show page with the host, latest episodes, subscribe links, and show stats.",
    category: "Podcast",
    tags: ["podcast", "audio", "episodes", "creator", "linkedin import"],
    thumbnail: "/template-thumbnails/podcast-show-page.svg",
  },
  dataMapping: {
    source: "linkedin-profile",
    fields: [
      {
        source: "name",
        description: "Primary profile name reused as the show name in the nav and hero.",
        targets: [
          { componentId: "podcast-nav-brand", kind: "text", field: "children" },
          { componentId: "podcast-hero-show", kind: "text", field: "children" },
        ],
      },
      {
        source: "headline",
        description: "Short professional headline shown as the show tagline beneath the title.",
        targets: [{ componentId: "podcast-hero-tagline", kind: "text", field: "children" }],
      },
      {
        source: "summary",
        description: "Profile summary/about text shown in the about-this-show section.",
        targets: [{ componentId: "podcast-about-copy", kind: "text", field: "children" }],
      },
      {
        source: "profilePhotoUrl",
        description: "Profile photo URL used for the circular host portrait.",
        targets: [{ componentId: "podcast-host-photo", kind: "attribute", field: "src" }],
      },
      {
        source: "positions",
        description: "Repeatable entries reinterpreted as latest episodes: position title becomes the episode title and its highlights become the episode description.",
        repeatable: true,
        targets: [{ componentId: "podcast-episodes-list", kind: "attribute", field: "children[]" }],
      },
      {
        source: "skills",
        description: "Reused as the list of topics the show covers.",
        repeatable: true,
        targets: [{ componentId: "podcast-topics-list", kind: "attribute", field: "children[]" }],
      },
      {
        source: "email",
        description: "Show contact address used for the listener mail link.",
        targets: [{ componentId: "podcast-contact-link", kind: "attribute", field: "href" }],
      },
    ],
  },
  content: {
    pages: [
      node("page", "podcast-show-template-page", {
        title: "The Longform Hour — Podcast",
        "custom-classes": "border-0 bg-[#fffbeb] shadow-none",
      }, [
        node("column", "podcast-shell", { "gap": "0", "custom-classes": "mx-auto w-full" }, [
          node("row", "podcast-nav", {
            "padding-top": "1.25rem",
            "padding-right": "2rem",
            "padding-bottom": "1.25rem",
            "padding-left": "2rem",
            "child-sizing": "natural",
            "align-items": "center",
            "justify-content": "between",
            gap: "1rem",
            "margin-left": "auto",
            "margin-right": "auto",
            "custom-classes": "[&>*]:!self-center mx-auto w-full max-w-4xl border-b border-amber-200 flex-wrap",
          }, [
            text("inline-text", "podcast-nav-brand", "The Longform Hour", {
              "custom-classes": "text-sm font-semibold uppercase tracking-[0.16em] text-amber-900",
            }),
            node("row", "podcast-nav-actions", {
              "child-sizing": "natural",
              "align-items": "center",
              gap: "0.75rem",
              "custom-classes": "[&>*]:!self-center ml-auto",
            }, [
              node("link", "podcast-nav-episodes", { href: "#episodes", "custom-classes": "text-sm font-medium text-amber-800 hover:text-amber-950" }, ["Episodes"]),
              node("button", "podcast-nav-cta", {
                variant: "default",
                size: "sm",
                "custom-classes": "rounded-full bg-amber-500 text-amber-950 hover:bg-amber-400",
              }, ["Subscribe"]),
            ]),
          ]),
          node("column", "podcast-hero", {
            "padding-top": "3rem",
            "padding-right": "2rem",
            "padding-bottom": "3rem",
            "padding-left": "2rem",
            "gap": "1.5rem",
            "align-items": "center",
            "margin-left": "auto",
            "margin-right": "auto",
            "custom-classes": "mx-auto w-full max-w-3xl text-center",
          }, [
            text("badge", "podcast-hero-badge", "New episode every Tuesday", {
              variant: "secondary",
              "custom-classes": "w-fit rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900",
            }),
            text("header1", "podcast-hero-show", "The Longform Hour", {
              "custom-classes": "py-0 text-5xl font-semibold tracking-[-0.04em] text-amber-950 md:text-6xl",
            }),
            text("paragraph", "podcast-hero-tagline", "Conversations with people who spend years on one hard problem.", {
              "custom-classes": "max-w-xl py-0 text-lg leading-8 text-amber-900/70",
            }),
            node("row", "podcast-hero-actions", {
              "child-sizing": "natural",
              "align-items": "center",
              "justify-content": "center",
              gap: "0.75rem",
              "custom-classes": "[&>*]:!self-center flex-wrap",
            }, [
              node("button", "podcast-hero-play", {
                variant: "default",
                size: "lg",
                "custom-classes": "rounded-full bg-amber-500 px-6 text-amber-950 hover:bg-amber-400",
              }, ["Play latest episode"]),
              node("link", "podcast-contact-link", {
                href: "mailto:hello@example.com",
                "custom-classes": "inline-flex items-center rounded-full border border-amber-300 px-6 py-3 text-sm font-medium text-amber-900 hover:bg-amber-100",
              }, ["Send us a tip"]),
            ]),
          ]),
          node("row", "podcast-stat-row", {
            "padding-top": "0",
            "padding-right": "2rem",
            "padding-bottom": "2.5rem",
            "padding-left": "2rem",
            "child-sizing": "natural",
            gap: "1.5rem",
            "margin-left": "auto",
            "margin-right": "auto",
            "custom-classes": "mx-auto w-full max-w-3xl flex-wrap md:flex-nowrap",
          }, [
            node("column", "podcast-stat-col-1", { "custom-classes": "min-w-0 flex-1 basis-28" }, [
              node("stat", "podcast-stat-1", {
                value: "128",
                "custom-classes": "h-full rounded-2xl border border-amber-200 bg-white shadow-none",
              }, ["Episodes published"]),
            ]),
            node("column", "podcast-stat-col-2", { "custom-classes": "min-w-0 flex-1 basis-28" }, [
              node("stat", "podcast-stat-2", {
                value: "42k",
                "custom-classes": "h-full rounded-2xl border border-amber-200 bg-white shadow-none",
              }, ["Monthly listeners"]),
            ]),
            node("column", "podcast-stat-col-3", { "custom-classes": "min-w-0 flex-1 basis-28" }, [
              node("stat", "podcast-stat-3", {
                value: "4.8",
                "custom-classes": "h-full rounded-2xl border border-amber-200 bg-white shadow-none",
              }, ["Average rating"]),
            ]),
          ]),
          node("column", "podcast-about-section", {
            id: "about",
            "padding-top": "2rem",
            "padding-right": "2rem",
            "padding-bottom": "2rem",
            "padding-left": "2rem",
            gap: "1.5rem",
            "margin-left": "auto",
            "margin-right": "auto",
            "custom-classes": "mx-auto w-full max-w-4xl border-t border-amber-200",
          }, [
            text("header2", "podcast-about-heading", "About the show", {
              "custom-classes": "py-0 text-xl font-semibold text-amber-950",
            }),
            node("row", "podcast-about-row", {
              "child-sizing": "natural",
              "align-items": "center",
              gap: "1.5rem",
              "custom-classes": "[&>*]:!self-center",
            }, [
              node("image", "podcast-host-photo", {
                src: "",
                fallbackSrc: "/avatars/sam-rivera.svg",
                alt: "Sam Rivera, host of The Longform Hour",
                width: "96px",
                height: "96px",
                borderRadius: "9999px",
                objectFit: "cover",
                objectPosition: "center",
                "custom-classes": "shrink-0 ring-4 ring-white shadow-[0_8px_24px_rgba(180,83,9,0.18)]",
              }),
              node("column", "podcast-about-body", { gap: "0.75rem", "custom-classes": "min-w-0 flex-1" }, [
                text("header3", "podcast-host-name", "Sam Rivera", {
                  "custom-classes": "py-0 text-base font-semibold text-amber-950",
                }),
                text("paragraph", "podcast-about-copy", "Sam has spent a decade interviewing the people behind long-running technical projects. Each episode sits down with one guest who has stuck with a hard problem for years, and stays for the unglamorous middle of the story.", {
                  "custom-classes": "py-0 text-sm leading-7 text-amber-900/70",
                }),
                node("column", "podcast-topics-list", {
                  "custom-classes": "flex-row flex-wrap items-center gap-2",
                }, [
                  text("badge", "podcast-topic-1", "Infrastructure", { variant: "outline", "custom-classes": "rounded-full border-amber-200 bg-amber-50 text-amber-900" }),
                  text("badge", "podcast-topic-2", "Research culture", { variant: "outline", "custom-classes": "rounded-full border-amber-200 bg-amber-50 text-amber-900" }),
                  text("badge", "podcast-topic-3", "Open source", { variant: "outline", "custom-classes": "rounded-full border-amber-200 bg-amber-50 text-amber-900" }),
                  text("badge", "podcast-topic-4", "Career longevity", { variant: "outline", "custom-classes": "rounded-full border-amber-200 bg-amber-50 text-amber-900" }),
                ]),
              ]),
            ]),
          ]),
          node("column", "podcast-episodes-section", {
            id: "episodes",
            "padding-top": "2rem",
            "padding-right": "2rem",
            "padding-bottom": "2.5rem",
            "padding-left": "2rem",
            "gap": "1rem",
            "margin-left": "auto",
            "margin-right": "auto",
            "custom-classes": "mx-auto w-full max-w-4xl border-t border-amber-200",
          }, [
            text("header2", "podcast-episodes-heading", "Latest episodes", {
              "custom-classes": "py-0 text-xl font-semibold text-amber-950",
            }),
            node("column", "podcast-episodes-list", { "gap": "0", "custom-classes": "w-full" }, [
              episodeRow("podcast-episode-1", "Keeping a database alive for a decade", "What actually breaks when nobody touches the schema for seven years, and the two engineers who learned to love it.", "48 min", "Sam Rivera", "sam-rivera"),
              episodeRow("podcast-episode-2", "The slow rewrite", "A team spent three years moving a monolith in the background while shipping every week. Here is how they sequenced it.", "62 min", "Maya Chen", "maya-chen"),
              episodeRow("podcast-episode-3", "Why open source maintainers burn out", "Three maintainers on handing off a project, saying no to drive-by pull requests, and finding someone to take the keys.", "35 min", "Priya Nathan", "priya-nathan"),
            ]),
          ]),
          node("column", "podcast-subscribe-section", {
            "padding-top": "3rem",
            "padding-right": "2rem",
            "padding-bottom": "3rem",
            "padding-left": "2rem",
            "gap": "1rem",
            "align-items": "center",
            "margin-left": "auto",
            "margin-right": "auto",
            "custom-classes": "mx-auto w-full max-w-3xl rounded-[2rem] bg-amber-500 text-center",
          }, [
            text("header2", "podcast-subscribe-heading", "Never miss an episode.", {
              "custom-classes": "py-0 text-3xl font-semibold text-amber-950",
            }),
            text("paragraph", "podcast-subscribe-copy", "Subscribe on your favourite app, or get the transcript in your inbox every Wednesday.", {
              "custom-classes": "max-w-md py-0 text-sm text-amber-950/75",
            }),
            node("row", "podcast-subscribe-actions", {
              "child-sizing": "natural",
              "align-items": "center",
              "justify-content": "center",
              gap: "0.75rem",
              "custom-classes": "[&>*]:!self-center flex-wrap",
            }, [
              node("button", "podcast-subscribe-primary", {
                variant: "default",
                size: "lg",
                "custom-classes": "rounded-full bg-amber-950 px-6 text-amber-50 hover:bg-amber-900",
              }, ["Subscribe now"]),
              node("link", "podcast-subscribe-secondary", {
                href: "https://example.com",
                target: "_blank",
                "custom-classes": "inline-flex items-center rounded-full border border-amber-700 px-6 py-3 text-sm font-medium text-amber-950 hover:bg-white",
              }, ["Browse all episodes"]),
            ]),
          ]),
        ]),
      ]),
    ],
  },
} as const satisfies PageTemplateDefinition