import { clonePageTemplatePages, describePageTemplateCatalog, describePageTemplateDisplayCatalog, getPageTemplateById, pageTemplateRegistry } from "@/client/features/page-templates"
import { applyTemplateFieldValues, listTemplateTextFields } from "@/client/features/page-templates"

describe("describePageTemplateCatalog", () => {
  it("describes every registered template from its own metadata, without page content", () => {
    const catalog = describePageTemplateCatalog()
    expect(catalog.map((entry) => entry.id)).toEqual(pageTemplateRegistry.map((template) => template.id))
    for (const [index, entry] of catalog.entries()) {
      const { metadata } = pageTemplateRegistry[index]
      expect(entry).toEqual({ id: pageTemplateRegistry[index].id, name: metadata.name, category: metadata.category, description: metadata.description, tags: metadata.tags })
    }
  })
})

describe("describePageTemplateDisplayCatalog", () => {
  it("projects display metadata, including thumbnails, without template payloads", () => {
    const catalog = describePageTemplateDisplayCatalog()
    expect(catalog.map((entry) => entry.id)).toEqual(pageTemplateRegistry.map((template) => template.id))
    for (const [index, entry] of catalog.entries()) {
      const template = pageTemplateRegistry[index]
      expect(entry).toEqual({
        id: template.id,
        name: template.metadata.name,
        description: template.metadata.description,
        category: template.metadata.category,
        tags: template.metadata.tags,
        thumbnail: template.metadata.thumbnail,
      })
      expect(entry).not.toHaveProperty("content")
      expect(entry).not.toHaveProperty("dataMapping")
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
      const serialized = JSON.stringify(applyTemplateFieldValues(clonePageTemplatePages(template), template, { ...values, bogus: "x", [Object.keys(values)[0]]: "  " }))
      for (const source of Object.keys(values).slice(1)) expect(serialized).toContain(`VALUE-${source}`)
      expect(serialized).not.toContain('"x"')
    }
  })

  it("does not mutate the pages it is given", () => {
    const template = getPageTemplateById("cv-resume-engineer-dark")!
    const pages = clonePageTemplatePages(template)
    const before = JSON.stringify(pages)
    applyTemplateFieldValues(pages, template, { name: "Priya" })
    expect(JSON.stringify(pages)).toBe(before)
  })
})
