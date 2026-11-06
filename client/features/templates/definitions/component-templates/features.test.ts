import { parseComponentTemplateDefinition } from "../../component-schema"
import { describeComponentTemplateDisplayCatalog, getComponentTemplateById } from "../../component-registry"
import { featuresTemplate } from "./features"

describe("features component template", () => {
  it("parses as a valid ComponentTemplateDefinition", () => {
    const parsed = parseComponentTemplateDefinition(featuresTemplate)
    expect(parsed.id).toBe("features")
    expect(parsed.metadata.name).toBe("Features")
    expect(parsed.metadata.category).toBe("Features")
    expect(parsed.metadata.tags).toContain("features")
    expect(parsed.content.root.tag).toBe("column")
  })

  it("is registered and appears in the catalog", () => {
    expect(getComponentTemplateById("features")).toBeDefined()
    expect(describeComponentTemplateDisplayCatalog().some((template) => template.id === "features")).toBe(true)
  })
})
