import { parsePageTemplateDefinition } from "@/client/features/templates/schema"
import { describeTemplateCatalog, getPageTemplateById } from "@/client/features/templates/registry"
import { realEstatePropertyTemplate } from "./real-estate-property"

type TemplateAppNode = Readonly<{
  tag: string
  attributes: Readonly<Record<string, string>>
  children: ReadonlyArray<TemplateAppNode | string>
}>

describe("real-estate-property template", () => {
  it("parses as a valid PageTemplateDefinition", () => {
    const parsed = parsePageTemplateDefinition(realEstatePropertyTemplate)

    expect(parsed.id).toBe("real-estate-property")
    expect(parsed.metadata.name).toBe("Real Estate Property")
    expect(parsed.metadata.category).toBe("Real Estate")
    expect(parsed.metadata.tags).toContain("real estate")
    expect(parsed.metadata.tags).toContain("property")
    expect(parsed.metadata.thumbnail).toBe("/template-thumbnails/real-estate-property.svg")
    expect(parsed.dataMapping.source).toBe("linkedin-profile")
    expect(parsed.dataMapping.fields.length).toBeGreaterThan(0)
    expect(parsed.content.pages.length).toBeGreaterThan(0)
  })

  it("maps every data field to a component that exists in the page", () => {
    const parsed = parsePageTemplateDefinition(realEstatePropertyTemplate)
    const componentIds = new Set<string>()
    const collect = (nodes: ReadonlyArray<TemplateAppNode>) => {
      for (const node of nodes) {
        componentIds.add(node.attributes.id)
        for (const child of node.children) {
          if (typeof child !== "string") collect([child as TemplateAppNode])
        }
      }
    }
    collect(parsed.content.pages as unknown as ReadonlyArray<TemplateAppNode>)

    const missing: string[] = []
    for (const field of parsed.dataMapping.fields) {
      for (const target of field.targets) {
        if (!componentIds.has(target.componentId)) missing.push(target.componentId)
      }
    }
    expect(missing).toEqual([])
  })

  it("is registered and appears in the catalog", () => {
    expect(getPageTemplateById("real-estate-property")).toBeDefined()
    expect(describeTemplateCatalog().some((template) => template.id === "real-estate-property")).toBe(true)
  })
})
