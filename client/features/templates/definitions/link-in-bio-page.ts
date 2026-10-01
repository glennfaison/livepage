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
  return {
    tag,
    attributes: {
      id,
      ...attributes,
    },
    children,
  } as const
}

const text = (
  tag: "header1" | "header2" | "header3" | "paragraph" | "badge" | "button" | "callout" | "inline-text",
  id: string,
  content: string,
  attributes: Readonly<Record<string, string>> = {},
) => node(tag, id, attributes, [content])

export const linkInBioTemplate = {
  schema: "livepage-template",
  version: 1,
  id: "link-in-bio-page",
  metadata: {
    name: "Link in Bio",
    description: "A single-column link hub for sharing your key profiles, projects, and contact details from one URL.",
    category: "Link in Bio",
    tags: ["link in bio", "creator", "social", "personal brand", "linkedin import"],
    thumbnail: "/template-thumbnails/link-in-bio-page.svg",
  },
  dataMapping: {
    source: "linkedin-profile",
    fields: [
      {
        source: "name",
        description: "Primary profile name shown under the avatar.",
        targets: [{ componentId: "bio-name", kind: "text", field: "children" }],
      },
      {
        source: "headline",
        description: "Short professional headline shown beneath the name.",
        targets: [{ componentId: "bio-headline", kind: "text", field: "children" }],
      },
      {
        source: "summary",
        description: "A short bio blurb shown above the link list.",
        targets: [{ componentId: "bio-summary", kind: "text", field: "children" }],
      },
      {
        source: "profilePhotoUrl",
        description: "Profile photo URL used for the circular avatar.",
        targets: [{ componentId: "bio-photo", kind: "attribute", field: "src" }],
      },
      {
        source: "linkedinUrl, githubUrl, websiteUrl, email",
        description: "Repeatable list of link buttons pointing at key profiles and contact channels.",
        repeatable: true,
        targets: [
          { componentId: "bio-links-list", kind: "attribute", field: "children[]" },
        ],
      },
      {
        source: "skills",
        description: "Optional list of interest/topic tags shown below the links.",
        repeatable: true,
        targets: [
          { componentId: "bio-tags-list", kind: "attribute", field: "children[]" },
        ],
      },
    ],
  },
  content: {
    pages: [
      node("page", "link-in-bio-template-page", {
        title: "Sam Rivera — Links",
        "custom-classes": "border-0 bg-gradient-to-b from-[#fef3f0] to-[#f8fafc] shadow-none",
      }, [
        node("column", "bio-shell", {
          "padding-top": "3.5rem",
          "padding-right": "1.5rem",
          "padding-bottom": "3.5rem",
          "padding-left": "1.5rem",
          "gap": "1.5rem",
          "align-items": "center",
          "custom-classes": "mx-auto w-full max-w-md",
        }, [
          node("image", "bio-photo", {
            alt: "Sam Rivera portrait placeholder",
            src: "",
            fallbackSrc: "/placeholder-img.svg?height=200&width=200",
            width: "112px",
            height: "112px",
            objectFit: "cover",
            objectPosition: "center",
            borderRadius: "9999px",
            loading: "lazy",
            decoding: "async",
            "custom-classes": "overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-[0_10px_28px_rgba(15,23,42,0.12)]",
          }),
          text("header1", "bio-name", "Sam Rivera", {
            "custom-classes": "py-0 text-center text-2xl font-semibold text-slate-900",
          }),
          text("paragraph", "bio-headline", "Video creator & photographer sharing behind-the-scenes stories.", {
            "custom-classes": "py-0 text-center text-sm font-medium text-slate-500",
          }),
          text("paragraph", "bio-summary", "New videos every Tuesday. Say hello, browse my latest work, or book a session below.", {
            "custom-classes": "py-0 text-center text-sm leading-6 text-slate-600",
          }),
          node("divider", "bio-divider-1", {
            color: "#e2e8f0",
            style: "solid",
          }),
          node("column", "bio-links-list", {
            "gap": "0.75rem",
            "custom-classes": "w-full",
          }, [
            node("link", "bio-link-website", {
              href: "https://example.com",
              target: "_blank",
              "custom-classes": "block w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50",
            }, ["🌐 My portfolio site"]),
            node("link", "bio-link-youtube", {
              href: "https://youtube.com",
              target: "_blank",
              "custom-classes": "block w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50",
            }, ["🎥 Latest video"]),
            node("link", "bio-link-linkedin", {
              href: "https://linkedin.com",
              target: "_blank",
              "custom-classes": "block w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50",
            }, ["💼 Connect on LinkedIn"]),
            node("link", "bio-link-github", {
              href: "https://github.com",
              target: "_blank",
              "custom-classes": "block w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50",
            }, ["💻 GitHub"]),
            node("link", "bio-link-email", {
              href: "mailto:sam@example.com",
              "custom-classes": "block w-full rounded-full bg-slate-900 px-5 py-3 text-center text-sm font-medium text-white shadow-sm hover:bg-slate-700",
            }, ["✉️ Book a session"]),
          ]),
          node("divider", "bio-divider-2", {
            color: "#e2e8f0",
            style: "solid",
          }),
          node("column", "bio-tags-list", {
            "custom-classes": "w-full flex-row flex-wrap items-center justify-center gap-2",
          }, [
            text("badge", "bio-tag-1", "Photography", { variant: "outline" }),
            text("badge", "bio-tag-2", "Filmmaking", { variant: "outline" }),
            text("badge", "bio-tag-3", "Travel", { variant: "outline" }),
          ]),
        ]),
      ]),
    ],
  },
} as const satisfies PageTemplateDefinition
