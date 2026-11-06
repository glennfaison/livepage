import { parseComponentTemplateDefinition } from "../../component-schema"
import { describeComponentTemplateDisplayCatalog, getComponentTemplateById } from "../../component-registry"
import { statsTemplate } from "./stats"

describe("stats component template", () => {
  it("parses as a valid ComponentTemplateDefinition", () => {
    const parsed = parseComponentTemplateDefinition(statsTemplate)
    expect(parsed.id).toBe("stats")
    expect(parsed.metadata.name).toBe("Stats")
    expect(parsed.metadata.category).toBe("Data")
    expect(parsed.metadata.tags).toContain("stats")
    expect(parsed.content.root.tag).toBe("column")
  })

  it("is registered and appears in the catalog", () => {
    expect(getComponentTemplateById("stats")).toBeDefined()
    expect(describeComponentTemplateDisplayCatalog().some((template) => template.id === "stats")).toBe(true)
  })
})
