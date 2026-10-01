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

export const blogArticlePageTemplate = {
  schema: "livepage-template",
  version: 1,
  id: "blog-article-page",
  metadata: {
    name: "Blog / Article",
    description: "A readable long-form article layout with a byline, pull quote, and an author bio card at the end.",
    category: "Blog",
    tags: ["blog", "article", "writing", "newsletter", "linkedin import"],
    thumbnail: "/template-thumbnails/blog-article-page.svg",
  },
  dataMapping: {
    source: "linkedin-profile",
    fields: [
      {
        source: "name",
        description: "Author name shown in the byline and the closing author card.",
        targets: [
          { componentId: "blog-byline-name", kind: "text", field: "children" },
          { componentId: "blog-author-name", kind: "text", field: "children" },
        ],
      },
      {
        source: "headline",
        description: "Author's professional headline shown under their name in the byline and author card.",
        targets: [
          { componentId: "blog-byline-headline", kind: "text", field: "children" },
          { componentId: "blog-author-headline", kind: "text", field: "children" },
        ],
      },
      {
        source: "summary",
        description: "Profile summary reused as the author bio in the closing author card.",
        targets: [{ componentId: "blog-author-bio", kind: "text", field: "children" }],
      },
      {
        source: "profilePhotoUrl",
        description: "Profile photo used for the byline avatar and author card avatar.",
        targets: [
          { componentId: "blog-byline-photo", kind: "attribute", field: "src" },
          { componentId: "blog-author-photo", kind: "attribute", field: "src" },
        ],
      },
      {
        source: "linkedinUrl, githubUrl, websiteUrl",
        description: "Public profile links shown in the closing author card.",
        targets: [{ componentId: "blog-author-links", kind: "attribute", field: "children[]" }],
      },
    ],
  },
  content: {
    pages: [
      node("page", "blog-article-template-page", {
        title: "The Quiet Cost of Context Switching",
        "custom-classes": "border-0 bg-white shadow-none",
      }, [
        node("column", "blog-shell", {
          "padding-top": "3.5rem",
          "padding-right": "1.5rem",
          "padding-bottom": "3.5rem",
          "padding-left": "1.5rem",
          "gap": "1.75rem",
          "custom-classes": "mx-auto w-full max-w-2xl",
        }, [
          text("inline-text", "blog-kicker", "PRODUCTIVITY", {
            "custom-classes": "text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600",
          }),
          text("header1", "blog-title", "The quiet cost of context switching", {
            "custom-classes": "py-0 text-4xl font-semibold leading-tight tracking-[-0.02em] text-slate-900 md:text-5xl",
          }),
          text("paragraph", "blog-deck", "Every notification feels small. Added up across a week, they are quietly rewriting how your best work gets done.", {
            "custom-classes": "py-0 text-lg leading-8 text-slate-500",
          }),
          node("row", "blog-byline", {
            "padding-top": "0.5rem",
            "child-sizing": "natural",
            "align-items": "center",
            "gap": "0.75rem",
          }, [
            node("image", "blog-byline-photo", {
              alt: "Author portrait placeholder",
              src: "",
              fallbackSrc: "/placeholder-img.svg?height=96&width=96",
              width: "44px",
              height: "44px",
              objectFit: "cover",
              borderRadius: "9999px",
              loading: "lazy",
              decoding: "async",
              "custom-classes": "overflow-hidden rounded-full border border-slate-200 bg-slate-100",
            }),
            node("column", "blog-byline-copy", { "gap": "0.1rem" }, [
              text("inline-text", "blog-byline-name", "Priya Nathan", { "custom-classes": "text-sm font-semibold text-slate-900" }),
              text("inline-text", "blog-byline-headline", "Engineering manager writing about focus and team habits", { "custom-classes": "text-xs text-slate-500" }),
            ]),
            node("time", "blog-published-time", { dateTime: "2026-09-18T09:00:00Z" }, ["Published"]),
          ]),
          node("image", "blog-hero-image", {
            alt: "Article cover illustration placeholder",
            src: "",
            fallbackSrc: "/placeholder-img.svg?height=520&width=1040",
            width: "100%",
            height: "320px",
            objectFit: "cover",
            borderRadius: "20px",
            loading: "lazy",
            decoding: "async",
            "custom-classes": "w-full overflow-hidden rounded-2xl bg-slate-100",
          }),
          text("paragraph", "blog-body-1", "A single interruption rarely feels costly. You glance at a message, answer in ten seconds, and return to what you were doing. The problem is that attention does not resume where it left off — it has to be rebuilt, piece by piece, from wherever the interruption dropped you.", {
            "custom-classes": "py-0 text-[1.05rem] leading-8 text-slate-700",
          }),
          text("header2", "blog-subheading-1", "Why switching feels free but isn't", {
            "custom-classes": "py-2 text-2xl font-semibold text-slate-900",
          }),
          text("paragraph", "blog-body-2", "Researchers call the gap between stopping one task and becoming fully re-immersed in another the \"resumption lag.\" It is short for simple tasks and long for anything that requires holding several ideas in your head at once, which describes most of the work worth doing.", {
            "custom-classes": "py-0 text-[1.05rem] leading-8 text-slate-700",
          }),
          node("callout", "blog-pull-quote", {
            tone: "info",
            "custom-classes": "text-lg font-medium",
          }, ["The most expensive meetings on your calendar are often the ones that happen inside your own head, every time you change tabs."]),
          text("paragraph", "blog-body-3", "Teams that protect long stretches of uninterrupted time do not do it because they dislike collaboration. They do it because they have learned, usually the hard way, that depth and availability trade off against each other.", {
            "custom-classes": "py-0 text-[1.05rem] leading-8 text-slate-700",
          }),
          text("header2", "blog-subheading-2", "Three habits that helped my team", {
            "custom-classes": "py-2 text-2xl font-semibold text-slate-900",
          }),
          text("paragraph", "blog-body-4", "We batched notifications into three windows a day, made \"focus blocks\" visible on shared calendars, and agreed that async messages get a same-day reply, not an instant one. None of it was novel. What mattered was writing it down and holding each other to it.", {
            "custom-classes": "py-0 text-[1.05rem] leading-8 text-slate-700",
          }),
          node("divider", "blog-divider-1", { color: "#e2e8f0", style: "solid" }),
          node("row", "blog-author-card", {
            "padding-top": "1.5rem",
            "padding-right": "1.5rem",
            "padding-bottom": "1.5rem",
            "padding-left": "1.5rem",
            "child-sizing": "natural",
            "align-items": "start",
            "gap": "1rem",
            "custom-classes": "rounded-3xl border border-slate-200 bg-slate-50",
          }, [
            node("image", "blog-author-photo", {
              alt: "Author portrait placeholder",
              src: "",
              fallbackSrc: "/placeholder-img.svg?height=160&width=160",
              width: "64px",
              height: "64px",
              objectFit: "cover",
              borderRadius: "9999px",
              loading: "lazy",
              decoding: "async",
              "custom-classes": "flex-none overflow-hidden rounded-full border border-white bg-slate-200",
            }),
            node("column", "blog-author-copy", { "gap": "0.35rem", "custom-classes": "min-w-0 flex-1" }, [
              text("header3", "blog-author-name", "Priya Nathan", { "custom-classes": "py-0 text-base font-semibold text-slate-900" }),
              text("inline-text", "blog-author-headline", "Engineering manager writing about focus and team habits", { "custom-classes": "text-xs text-slate-500" }),
              text("paragraph", "blog-author-bio", "Priya leads a platform team of twelve and writes weekly about the unglamorous mechanics of getting good work done together.", { "custom-classes": "py-0 text-sm leading-6 text-slate-600" }),
              node("row", "blog-author-links", { "padding-top": "0.25rem", "child-sizing": "natural", "align-items": "center", "gap": "0.75rem" }, [
                node("link", "blog-author-link-linkedin", { href: "https://linkedin.com", target: "_blank", "custom-classes": "text-xs font-medium text-indigo-600 underline-offset-4 hover:underline" }, ["LinkedIn"]),
                node("link", "blog-author-link-website", { href: "https://example.com", target: "_blank", "custom-classes": "text-xs font-medium text-indigo-600 underline-offset-4 hover:underline" }, ["More essays"]),
              ]),
            ]),
          ]),
        ]),
      ]),
    ],
  },
} as const satisfies PageTemplateDefinition
