import { cloneTemplatePages, describeTemplateCatalog, getPageTemplateById, pageTemplateRegistry } from "@/features/templates"
import { applyTemplateFieldValues, listTemplateTextFields } from "@/features/templates"

describe("describeTemplateCatalog", () => {
  it("describes every registered template from its own metadata, without page content", () => {
    const catalog = describeTemplateCatalog()
    expect(catalog.map((entry) => entry.id)).toEqual(pageTemplateRegistry.map((template) => template.id))
    for (const [index, entry] of catalog.entries()) {
      const { metadata } = pageTemplateRegistry[index]
      expect(entry).toEqual({ id: pageTemplateRegistry[index].id, name: metadata.name, category: metadata.category, description: metadata.description, tags: metadata.tags })
    }
  })
})

describe("template text fields", () => {
  it("lists only single-value text slots, derived from each template's dataMapping", () => {
    for (const template of pageTemplateRegistry) {
      const sources = listTemplateTextFields(template).map((field) => field.source)
      const repeatable = template.dataMapping.fields.filter((field) => field.repeatable).map((field) => field.source)
      expect(sources.length).toBeGreaterThan(0)
      expect(sources.some((source) => repeatable.includes(source))).toBe(false)
    }
  })

  it("writes values into every mapped target of every template, and ignores blank or unknown keys", () => {
    for (const template of pageTemplateRegistry) {
      const values = Object.fromEntries(listTemplateTextFields(template).map((field) => [field.source, `VALUE-${field.source}`]))
      const serialized = JSON.stringify(applyTemplateFieldValues(cloneTemplatePages(template), template, { ...values, bogus: "x", [Object.keys(values)[0]]: "  " }))
      for (const source of Object.keys(values).slice(1)) expect(serialized).toContain(`VALUE-${source}`)
      expect(serialized).not.toContain('"x"')
    }
  })

  it("does not mutate the pages it is given", () => {
    const template = getPageTemplateById("cv-resume-engineer-dark")!
    const pages = cloneTemplatePages(template)
    const before = JSON.stringify(pages)
    applyTemplateFieldValues(pages, template, { name: "Priya" })
    expect(JSON.stringify(pages)).toBe(before)
  })
})
