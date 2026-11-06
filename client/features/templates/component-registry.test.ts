import {
  describeComponentTemplateDisplayCatalog,
  getComponentTemplateById,
  getComponentTemplateRegistry,
  getComponentTemplatesAllowedIn,
} from "./component-registry"

describe("component template registry", () => {
  it("registers the first batch with unique ids", () => {
    const ids = getComponentTemplateRegistry().map((template) => template.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toContain("call-to-action")
    expect(ids).toContain("hero")
    expect(ids).toContain("features")
    expect(ids).toContain("stats")
    expect(ids).toContain("testimonial")
  })

  it("resolves a template by id", () => {
    expect(getComponentTemplateById("call-to-action")?.metadata.name).toBe("Call to Action")
    expect(getComponentTemplateById("does-not-exist")).toBeUndefined()
  })

  it("describes the display catalog including the root tag", () => {
    const summaries = describeComponentTemplateDisplayCatalog()
    expect(summaries.length).toBe(getComponentTemplateRegistry().length)
    const cta = summaries.find((summary) => summary.id === "call-to-action")
    expect(cta?.rootTag).toBe("column")
    expect(cta?.thumbnail).toBe("/component-template-thumbnails/call-to-action.svg")
  })

  it("offers templates allowed inside a column parent", () => {
    const allowed = getComponentTemplatesAllowedIn("column")
    expect(allowed.length).toBeGreaterThan(0)
    expect(allowed.map((template) => template.id)).toContain("call-to-action")
  })

  it("offers no templates inside a parent that cannot accept children", () => {
    expect(getComponentTemplatesAllowedIn("button")).toEqual([])
    expect(getComponentTemplatesAllowedIn("paragraph")).toEqual([])
  })
})
