type TemplateNode = Readonly<{
  tag: string
  attributes: Readonly<Record<string, string>>
  children: ReadonlyArray<TemplateNode | string>
}>

function node(tag: string, id: string, attributes: Readonly<Record<string, string>> = {}, children: ReadonlyArray<TemplateNode | string> = []): TemplateNode {
  return { tag, attributes: { id, ...attributes }, children }
}

function text(tag: string, id: string, content: string, attributes: Readonly<Record<string, string>> = {}): TemplateNode {
  return node(tag, id, attributes, [content])
}

const mapping = {
  source: "linkedin-profile" as const,
  fields: [
    { source: "name", description: "Profile name.", targets: [{ componentId: "engineer-name", kind: "text" as const, field: "children" }] },
    { source: "headline", description: "Professional headline.", targets: [{ componentId: "engineer-headline", kind: "text" as const, field: "children" }] },
    { source: "summary", description: "Professional summary.", targets: [{ componentId: "engineer-summary", kind: "text" as const, field: "children" }] },
    { source: "positions", description: "Repeatable experience entries.", repeatable: true, targets: [{ componentId: "engineer-experience", kind: "attribute" as const, field: "children[]" }] },
    { source: "education", description: "Education history.", repeatable: true, targets: [{ componentId: "engineer-education", kind: "attribute" as const, field: "children[]" }] },
  ],
}

const darkContent = [
  node("page", "engineer-dark-page", { title: "Jordan Lee — Software Engineer", "custom-classes": "min-h-screen bg-[#0b1017] text-slate-100" }, [
    node("column", "engineer-dark-shell", { "padding-top": "2rem", "padding-right": "3rem", "padding-bottom": "2rem", "padding-left": "3rem", "gap": "0", "custom-classes": "mx-auto w-full max-w-4xl" }, [
      node("row", "engineer-dark-nav", { "padding-bottom": "1.25rem", "child-sizing": "natural", "align-items": "center", "justify-content": "between", "gap": "1rem", "custom-classes": "border-b border-slate-800" }, [
        text("inline-text", "engineer-dark-brand", "Jordan Lee", { "custom-classes": "font-mono text-xs font-semibold tracking-[0.18em] text-slate-100" }),
        node("row", "engineer-dark-nav-links", { "child-sizing": "natural", "align-items": "center", "justify-content": "end", "gap": "1rem" }, [
          node("link", "engineer-dark-nav-experience", { href: "#experience", "custom-classes": "font-mono text-[10px] text-slate-400" }, ["Experience"]),
          node("link", "engineer-dark-nav-contact", { href: "#contact", "custom-classes": "font-mono text-[10px] text-slate-400" }, ["Contact"]),
        ]),
      ]),
      node("column", "engineer-dark-hero", { "padding-top": "4rem", "padding-bottom": "4rem", "gap": "1.25rem", "custom-classes": "border-b border-slate-800" }, [
        text("inline-text", "engineer-dark-kicker", "SENIOR BACKEND ENGINEER", { "custom-classes": "font-mono text-xs tracking-[0.18em] text-cyan-400" }),
        text("header1", "engineer-name", "Jordan Lee", { "custom-classes": "py-0 text-5xl font-semibold tracking-[-0.06em] text-slate-100 md:text-6xl" }),
        text("paragraph", "engineer-headline", "Distributed systems engineer building dependable APIs, data platforms, and developer tools.", { "custom-classes": "max-w-2xl py-0 text-base leading-7 text-slate-400" }),
        text("paragraph", "engineer-summary", "I have spent the last eight years turning complex infrastructure into simple products. My work spans Go, TypeScript, cloud platforms, and high-scale event systems.", { "custom-classes": "max-w-2xl py-0 text-sm leading-7 text-slate-300" }),
        node("row", "engineer-dark-links", { "padding-top": "0.5rem", "child-sizing": "natural", "align-items": "center", "gap": "1rem" }, [
          node("link", "engineer-email", { href: "mailto:jordan@example.com", "custom-classes": "font-mono text-xs text-cyan-400" }, ["Email"]),
          node("link", "engineer-github", { href: "https://github.com", "custom-classes": "font-mono text-xs text-cyan-400" }, ["GitHub"]),
          node("link", "engineer-linkedin", { href: "https://linkedin.com", "custom-classes": "font-mono text-xs text-cyan-400" }, ["LinkedIn"]),
        ]),
      ]),
      node("column", "engineer-dark-experience-section", { id: "experience", "padding-top": "3rem", "padding-bottom": "3rem", "gap": "1.5rem", "custom-classes": "border-b border-slate-800" }, [
        text("header2", "engineer-dark-experience-heading", "Experience", { "custom-classes": "py-0 text-xl font-semibold text-slate-100" }),
        node("column", "engineer-experience", { "gap": "0", "custom-classes": "mt-2" }, [
          node("column", "engineer-dark-job-1", { "padding-top": "1.5rem", "padding-bottom": "1.5rem", "gap": "0.5rem", "custom-classes": "border-b border-slate-800" }, [
            node("row", "engineer-dark-job-1-heading", { "child-sizing": "natural", "align-items": "baseline", "justify-content": "between", "gap": "1rem" }, [
              text("header3", "engineer-dark-job-1-title", "Senior Software Engineer", { "custom-classes": "py-0 text-sm font-semibold text-slate-100" }),
              text("inline-text", "engineer-dark-job-1-date", "2022 — Present", { "custom-classes": "font-mono text-[10px] text-slate-500" }),
            ]),
            text("inline-text", "engineer-dark-job-1-company", "Northstar Systems", { "custom-classes": "text-xs text-cyan-400" }),
            text("paragraph", "engineer-dark-job-1-copy", "Built event-driven services and internal platforms used by teams across the company. Reduced deployment time by 60% through safer tooling and paved paths.", { "custom-classes": "py-0 text-sm leading-6 text-slate-400" }),
          ]),
          node("column", "engineer-dark-job-2", { "padding-top": "1.5rem", "padding-bottom": "1.5rem", "gap": "0.5rem", "custom-classes": "border-b border-slate-800" }, [
            node("row", "engineer-dark-job-2-heading", { "child-sizing": "natural", "align-items": "baseline", "justify-content": "between", "gap": "1rem" }, [
              text("header3", "engineer-dark-job-2-title", "Software Engineer", { "custom-classes": "py-0 text-sm font-semibold text-slate-100" }),
              text("inline-text", "engineer-dark-job-2-date", "2019 — 2022", { "custom-classes": "font-mono text-[10px] text-slate-500" }),
            ]),
            text("inline-text", "engineer-dark-job-2-company", "Cloudline", { "custom-classes": "text-xs text-cyan-400" }),
            text("paragraph", "engineer-dark-job-2-copy", "Designed APIs and observability workflows for a multi-region SaaS platform, improving reliability and reducing operational toil.", { "custom-classes": "py-0 text-sm leading-6 text-slate-400" }),
          ]),
        ]),
      ]),
      node("column", "engineer-dark-skills", { "padding-top": "3rem", "padding-bottom": "3rem", "gap": "1.25rem", "custom-classes": "border-b border-slate-800" }, [
        text("header2", "engineer-dark-skills-heading", "Skills", { "custom-classes": "py-0 text-xl font-semibold text-slate-100" }),
        text("paragraph", "engineer-dark-skills-copy", "Go · TypeScript · PostgreSQL · Kafka · Kubernetes · AWS · Terraform · REST · GraphQL · CI/CD", { "custom-classes": "py-0 font-mono text-xs leading-6 text-slate-400" }),
      ]),
      node("column", "engineer-dark-education", { id: "education", "padding-top": "3rem", "padding-bottom": "3rem", "gap": "0.5rem", "custom-classes": "border-b border-slate-800" }, [
        text("header2", "engineer-dark-education-heading", "Education", { "custom-classes": "py-0 text-xl font-semibold text-slate-100" }),
        text("header3", "engineer-education", "B.S. Computer Science · University of Washington", { "custom-classes": "py-0 text-sm font-semibold text-slate-100" }),
        text("inline-text", "engineer-dark-education-date", "2015 — 2019", { "custom-classes": "font-mono text-xs text-slate-500" }),
      ]),
      node("column", "engineer-dark-contact", { id: "contact", "padding-top": "3rem", "padding-bottom": "3rem", "gap": "0.75rem" }, [
        text("header2", "engineer-dark-contact-heading", "Let’s build something useful.", { "custom-classes": "py-0 text-xl font-semibold text-slate-100" }),
        text("paragraph", "engineer-dark-contact-copy", "Open to infrastructure, platform, and product engineering opportunities.", { "custom-classes": "py-0 text-sm text-slate-400" }),
        node("link", "engineer-dark-contact-link", { href: "mailto:jordan@example.com", "custom-classes": "w-fit font-mono text-xs text-cyan-400" }, ["jordan@example.com"]),
      ]),
    ]),
  ]),
]

const lightContent = (JSON.parse(
  JSON.stringify(darkContent)
    .replaceAll("#0b1017", "#f8fafc")
    .replaceAll("text-slate-100", "text-slate-900")
    .replaceAll("text-slate-300", "text-slate-700")
    .replaceAll("text-slate-400", "text-slate-600")
    .replaceAll("border-slate-800", "border-slate-200")
    .replaceAll("text-cyan-400", "text-blue-600"),
) as ReadonlyArray<TemplateNode>).map((page, index) => index === 0 ? {
  ...page,
  attributes: {
    ...page.attributes,
    id: "engineer-light-page",
    title: "Jordan Lee — Software Engineer",
    "custom-classes": "min-h-screen bg-[#f8fafc] text-slate-900",
  },
} : page)

export const cvResumeEngineerDarkTemplate = {
  schema: "livepage-template",
  version: 1,
  id: "cv-resume-engineer-dark",
  metadata: {
    name: "Engineer CV / Dark",
    description: "A dark, minimalist one-page CV for software engineers and platform builders.",
    category: "CV/Resume",
    tags: ["resume", "cv", "software engineer", "developer", "dark", "minimal"],
    thumbnail: "/template-thumbnails/cv-resume-engineer-dark.svg",
  },
  dataMapping: mapping,
  content: { pages: darkContent },
} as const

export const cvResumeEngineerLightTemplate = {
  schema: "livepage-template",
  version: 1,
  id: "cv-resume-engineer-light",
  metadata: {
    name: "Engineer CV / Light",
    description: "A light, editorial one-page CV for software engineers and platform builders.",
    category: "CV/Resume",
    tags: ["resume", "cv", "software engineer", "developer", "light", "editorial"],
    thumbnail: "/template-thumbnails/cv-resume-engineer-light.svg",
  },
  dataMapping: mapping,
  content: { pages: lightContent },
} as const
