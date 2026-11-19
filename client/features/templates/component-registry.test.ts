import {
  describeComponentTemplateDisplayCatalog,
  getComponentTemplateById,
  getComponentTemplateRegistry,
  getComponentTemplatesAllowedIn,
} from "./component-registry"
import { getComponentsAllowedIn } from "@/client/features/design-components/registry-store"

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

  describe("getComponentTemplatesAllowedIn compatibility matrix", () => {
    // All current templates use root tag "column". The matrix therefore
    // exercises (parent tag × column) against the same rules as
    // getComponentsAllowedIn, plus the undefined / root-level cases.
    const allTemplateIds = () =>
      getComponentTemplateRegistry().map((template) => template.id).sort()

    it("returns every registered template when the parent accepts column", () => {
      // page, row, and column all accept children and do not exclude column.
      for (const parentTag of ["page", "row", "column"] as const) {
        const allowedByRegistry = getComponentsAllowedIn(parentTag).map((m) => m.tag)
        expect(allowedByRegistry).toContain("column")

        const templates = getComponentTemplatesAllowedIn(parentTag)
        expect(templates.map((t) => t.id).sort()).toEqual(allTemplateIds())
      }
    })

    it("returns an empty list for parents that do not accept children", () => {
      for (const parentTag of ["button", "paragraph", "header1", "image", "link"] as const) {
        expect(getComponentTemplatesAllowedIn(parentTag)).toEqual([])
      }
    })

    it("returns an empty list when parentTag is undefined (direct page-root / no parent)", () => {
      // Callers hide the Templates entry for the page root; when they pass
      // undefined (no parent slot), the filter yields nothing rather than erroring.
      expect(getComponentTemplatesAllowedIn(undefined)).toEqual([])
      expect(getComponentTemplatesAllowedIn()).toEqual([])
    })

    it("returns an empty list for an unknown parent tag", () => {
      expect(getComponentTemplatesAllowedIn("not-a-real-tag")).toEqual([])
    })

    it("never throws and always returns an array", () => {
      const cases = [undefined, "page", "column", "button", "not-a-real-tag", ""] as const
      for (const parentTag of cases) {
        const result = getComponentTemplatesAllowedIn(parentTag as string | undefined)
        expect(Array.isArray(result)).toBe(true)
        expect(() => getComponentTemplatesAllowedIn(parentTag as string | undefined)).not.toThrow()
      }
    })

    it("agrees with getComponentsAllowedIn for every template root tag", () => {
      const parents = ["page", "row", "column", "button", "paragraph"] as const
      for (const parentTag of parents) {
        const allowedTags = new Set(getComponentsAllowedIn(parentTag).map((m) => m.tag))
        const templates = getComponentTemplatesAllowedIn(parentTag)
        for (const template of templates) {
          expect(allowedTags.has(template.content.root.tag)).toBe(true)
        }
        // Every registered template whose root is in allowedTags must appear.
        for (const template of getComponentTemplateRegistry()) {
          if (allowedTags.has(template.content.root.tag)) {
            expect(templates.map((t) => t.id)).toContain(template.id)
          }
        }
      }
    })
  })
})
