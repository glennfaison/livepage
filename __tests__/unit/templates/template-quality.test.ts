import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { pageTemplateRegistry } from "@/client/features/templates"

type Node = Readonly<{ tag: string; attributes: Readonly<Record<string, string>>; children: ReadonlyArray<Node | string> }>

const publicDir = path.join(process.cwd(), "public")

// Templates still waiting for their design pass. Remove an entry when its template is fixed; the ratchet below fails if you forget.
const knownLeftovers: Readonly<Record<string, ReadonlyArray<string>>> = {
  "centered columns set explicit auto margins": [
    "agency-homepage",
    "cv-resume-engineer-dark",
    "cv-resume-engineer-light",
    "cv-resume-personal-website",
    "event-conference-page",
    "landing-page-saas",
  ],
  "no placeholder images": ["cv-resume-personal-website"],
}

function expectRule(rule: string, templateId: string, violations: ReadonlyArray<string>): void {
  if (knownLeftovers[rule]?.includes(templateId)) {
    expect(violations).not.toEqual([])
    return
  }
  expect(violations).toEqual([])
}

function walk(nodes: ReadonlyArray<Node | string>, visit: (node: Node) => void): void {
  for (const node of nodes) {
    if (typeof node === "string") continue
    visit(node)
    walk(node.children, visit)
  }
}

function collect(template: (typeof pageTemplateRegistry)[number]): ReadonlyArray<Node> {
  const nodes: Node[] = []
  walk(template.content.pages as unknown as ReadonlyArray<Node>, (node) => nodes.push(node))
  return nodes
}

describe.each(pageTemplateRegistry.map((template) => [template.id, template] as const))("template quality: %s", (_id, template) => {
  const nodes = collect(template)

  it("uses unique component ids", () => {
    const ids = nodes.map((node) => node.attributes.id)
    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([])
  })

  it("has no placeholder images, and every local image asset exists", () => {
    const placeholders: string[] = []
    const missing: string[] = []
    for (const node of nodes.filter((candidate) => candidate.tag === "image")) {
      const source = node.attributes.fallbackSrc || node.attributes.src || ""
      if (!source || source.includes("placeholder-img")) placeholders.push(node.attributes.id)
      else if (source.startsWith("/") && !existsSync(path.join(publicDir, source.split("?")[0]))) missing.push(node.attributes.id)
    }
    expectRule("no placeholder images", template.id, placeholders)
    expect(missing).toEqual([])
  })

  it("keeps local SVG assets self-contained", () => {
    for (const node of nodes.filter((candidate) => candidate.tag === "image")) {
      const source = (node.attributes.fallbackSrc || node.attributes.src).split("?")[0]
      if (!source.endsWith(".svg") || !source.startsWith("/")) continue
      const svg = readFileSync(path.join(publicDir, source), "utf8")
      expect(svg).not.toMatch(/(href|src)=["']https?:/)
    }
  })

  it("sets explicit auto margins on centered max-width columns", () => {
    const violations = nodes
      .filter((node) => /\bmx-auto\b/.test(node.attributes["custom-classes"] ?? "") && /\bmax-w-/.test(node.attributes["custom-classes"] ?? ""))
      .filter((node) => node.attributes["margin-left"] !== "auto" || node.attributes["margin-right"] !== "auto")
      .map((node) => node.attributes.id)
    expectRule("centered columns set explicit auto margins", template.id, violations)
  })

  it("lets rows that contain fixed-size images size their children naturally", () => {
    for (const node of nodes.filter((candidate) => candidate.tag === "row")) {
      const hasFixedImage = node.children.some((child) => typeof child !== "string" && child.tag === "image" && /px$/.test(child.attributes.width ?? ""))
      if (hasFixedImage) expect(node.attributes["child-sizing"]).toBe("natural")
    }
  })
})
