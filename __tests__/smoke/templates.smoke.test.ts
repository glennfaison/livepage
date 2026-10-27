import { pageTemplateRegistry, getPageTemplateById } from "@/client/features/templates"

/**
 * Smoke: every bundled template registers, resolves by id, and carries a
 * non-empty page payload. Fast structural guard; deeper checks live in unit.
 */
describe("smoke: bundled templates", () => {
  it("registers at least one template with unique ids", () => {
    const ids = pageTemplateRegistry.map((template) => template.id)
    expect(ids.length).toBeGreaterThan(0)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(pageTemplateRegistry.map((template) => [template.id] as const))("%s loads with page content", (id) => {
    const template = getPageTemplateById(id)
    expect(template).toBeDefined()
    expect(template!.metadata.name).toBeTruthy()
    expect(template!.content.pages.length).toBeGreaterThan(0)
  })
})
