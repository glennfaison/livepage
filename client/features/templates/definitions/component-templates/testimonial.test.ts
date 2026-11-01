import { parseComponentTemplateDefinition } from "../../component-schema"
import { describeComponentTemplateDisplayCatalog, getComponentTemplateById } from "../../component-registry"
import { testimonialTemplate } from "./testimonial"

describe("testimonial component template", () => {
  it("parses as a valid ComponentTemplateDefinition", () => {
    const parsed = parseComponentTemplateDefinition(testimonialTemplate)
    expect(parsed.id).toBe("testimonial")
    expect(parsed.metadata.name).toBe("Testimonial")
    expect(parsed.metadata.category).toBe("Feedback")
    expect(parsed.metadata.tags).toContain("testimonial")
    expect(parsed.content.root.tag).toBe("column")
  })

  it("is registered and appears in the catalog", () => {
    expect(getComponentTemplateById("testimonial")).toBeDefined()
    expect(describeComponentTemplateDisplayCatalog().some((template) => template.id === "testimonial")).toBe(true)
  })
})
