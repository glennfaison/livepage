import { parsePageTemplateDefinition } from "@/client/features/templates/schema"
import { describeTemplateCatalog, getPageTemplateById } from "@/client/features/templates/registry"
import { restaurantMenuTemplate } from "./restaurant-menu"

type TemplateAppNode = Readonly<{
  tag: string
  attributes: Readonly<Record<string, string>>
  children: ReadonlyArray<TemplateAppNode | string>
}>

describe("restaurant-menu template", () => {
  it("parses as a valid PageTemplateDefinition", () => {
    const parsed = parsePageTemplateDefinition(restaurantMenuTemplate)

    expect(parsed.id).toBe("restaurant-menu")
    expect(parsed.metadata.name).toBe("Restaurant Menu")
    expect(parsed.metadata.category).toBe("Restaurant")
    expect(parsed.metadata.tags).toContain("restaurant")
    expect(parsed.metadata.tags).toContain("menu")
    expect(parsed.metadata.thumbnail).toBe("/template-thumbnails/restaurant-menu.svg")
    expect(parsed.dataMapping.source).toBe("linkedin-profile")
    expect(parsed.dataMapping.fields.length).toBeGreaterThan(0)
    expect(parsed.content.pages.length).toBeGreaterThan(0)
  })

  it("maps every data field to a component that exists in the page", () => {
    const parsed = parsePageTemplateDefinition(restaurantMenuTemplate)
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
    expect(getPageTemplateById("restaurant-menu")).toBeDefined()
    expect(describeTemplateCatalog().some((template) => template.id === "restaurant-menu")).toBe(true)
  })
})
