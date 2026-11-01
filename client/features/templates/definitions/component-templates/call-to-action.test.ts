import { parseComponentTemplateDefinition } from "../../component-schema"
import { describeComponentTemplateDisplayCatalog, getComponentTemplateById } from "../../component-registry"
import { callToActionTemplate } from "./call-to-action"

describe("call-to-action component template", () => {
  it("parses as a valid ComponentTemplateDefinition", () => {
    const parsed = parseComponentTemplateDefinition(callToActionTemplate)
    expect(parsed.id).toBe("call-to-action")
    expect(parsed.metadata.name).toBe("Call to Action")
    expect(parsed.metadata.category).toBe("Conversion")
    expect(parsed.metadata.tags).toContain("cta")
    expect(parsed.content.root.tag).toBe("column")
  })

  it("is registered and appears in the catalog", () => {
    expect(getComponentTemplateById("call-to-action")).toBeDefined()
    expect(describeComponentTemplateDisplayCatalog().some((template) => template.id === "call-to-action")).toBe(true)
  })
})
