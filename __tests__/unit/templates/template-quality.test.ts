import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { pageTemplateRegistry } from "@/client/features/templates"

type Node = Readonly<{ tag: string; attributes: Readonly<Record<string, string>>; children: ReadonlyArray<Node | string> }>

const publicDir = path.join(process.cwd(), "public")

// Templates must pass the quality checks without any allowlist exceptions.
const knownLeftovers: Readonly<Record<string, ReadonlyArray<string>>> = {}

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
    expect(ids.filter((id) => !id)).toEqual([])
    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([])
  })

  it("has no placeholder images, and every local image asset exists", () => {
    const placeholders: string[] = []
    const missing: string[] = []
    for (const node of nodes.filter((candidate) => candidate.tag === "image")) {
      const source = node.attributes.fallbackSrc || node.attributes.src || ""
      if (!source || source.includes("placeholder-img")) placeholders.push(node.attributes.id)
      else if (source.startsWith("/") && !source.startsWith("//") && !existsSync(path.join(publicDir, source.split("?")[0]))) missing.push(node.attributes.id)
    }
    expectRule("no placeholder images", template.id, placeholders)
    expect(missing).toEqual([])
  })

  it("keeps local SVG assets self-contained", () => {
    for (const node of nodes.filter((candidate) => candidate.tag === "image")) {
      const source = (node.attributes.fallbackSrc || node.attributes.src).split("?")[0]
      if (!source.endsWith(".svg") || !source.startsWith("/") || source.startsWith("//")) continue
      const file = path.join(publicDir, source)
      expect(existsSync(file)).toBe(true)
      const svg = readFileSync(file, "utf8")
      expect(svg).not.toMatch(/(href|src)=["']?(https?:)?\/\//)
      expect(svg).not.toMatch(/url\(\s*["']?(https?:)?\/\//)
      expect(svg).not.toMatch(/@import/)
    }
  })

  it("sets explicit auto margins on centered max-width columns", () => {
    const violations = nodes
      .filter((node) => /\bmx-auto\b/.test(node.attributes["custom-classes"] ?? "") && /\bmax-w-/.test(node.attributes["custom-classes"] ?? ""))
      .filter((node) => node.attributes["margin-left"] !== "auto" || node.attributes["margin-right"] !== "auto")
      .map((node) => node.attributes.id)
    expectRule("centered columns set explicit auto margins", template.id, violations)
  })

  it("asks rows to wrap through the wrap setting, not a flex-wrap class", () => {
		// Only equal-sized rows are affected: they get `basis-0`, and a zero basis means
		// `flex-wrap` can never break the line. Rows with natural child sizing size their
		// children to content, so a plain `flex-wrap` class on those is meaningful.
		const violations = nodes
			.filter((node) => node.tag === "row" && node.attributes["child-sizing"] !== "natural")
			.filter((node) => /\b(?:md|lg|xl|sm):?flex-wrap\b|\bflex-wrap\b/.test(node.attributes["custom-classes"] ?? ""))
			.map((node) => node.attributes.id)
		expectRule("rows wrap through the wrap setting", template.id, violations)
	})

	it("lets rows that contain fixed-size images size their children naturally", () => {
    for (const node of nodes.filter((candidate) => candidate.tag === "row")) {
      const hasFixedImage = node.children.some((child) => typeof child !== "string" && child.tag === "image" && /(px|rem|em)$/.test(child.attributes.width ?? ""))
      if (hasFixedImage) expect(node.attributes["child-sizing"]).toBe("natural")
    }
  })
})
