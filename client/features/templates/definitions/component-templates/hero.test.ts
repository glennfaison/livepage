import { parseComponentTemplateDefinition } from "../../component-schema"
import { describeComponentTemplateDisplayCatalog, getComponentTemplateById } from "../../component-registry"
import { heroTemplate } from "./hero"

describe("hero component template", () => {
  it("parses as a valid ComponentTemplateDefinition", () => {
    const parsed = parseComponentTemplateDefinition(heroTemplate)
    expect(parsed.id).toBe("hero")
    expect(parsed.metadata.name).toBe("Hero")
    expect(parsed.metadata.category).toBe("Hero")
    expect(parsed.metadata.tags).toContain("hero")
    expect(parsed.content.root.tag).toBe("column")
  })

  it("is registered and appears in the catalog", () => {
    expect(getComponentTemplateById("hero")).toBeDefined()
    expect(describeComponentTemplateDisplayCatalog().some((template) => template.id === "hero")).toBe(true)
  })
})
