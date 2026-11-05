import { parseComponentTemplateDefinition, type ComponentTemplateDefinition } from "./component-schema"
import { callToActionTemplate } from "./definitions/component-templates/call-to-action"

type TemplateAppNode = Readonly<{
  tag: string
  attributes: Readonly<Record<string, string>>
  children: ReadonlyArray<TemplateAppNode | string>
}>

describe("component template schema", () => {
  it("parses a valid ComponentTemplateDefinition", () => {
    const parsed = parseComponentTemplateDefinition(callToActionTemplate)

    expect(parsed.schema).toBe("livepage-component-template")
    expect(parsed.id).toBe("call-to-action")
    expect(parsed.metadata.name).toBe("Call to Action")
    expect(parsed.metadata.category).toBe("Conversion")
    expect(parsed.content.root.tag).toBe("column")
    expect(parsed.content.root.attributes.id).toBe("cta-root")
  })

  it("rejects a template with the wrong schema literal", () => {
    const bad = { ...callToActionTemplate, schema: "livepage-template" } as unknown
    expect(() => parseComponentTemplateDefinition(bad)).toThrow()
  })

  it("rejects a template without a root node", () => {
    const bad = { ...callToActionTemplate, content: { root: undefined as unknown as TemplateAppNode } } as unknown
    expect(() => parseComponentTemplateDefinition(bad)).toThrow()
  })

  it("rejects a template with an unregistered root tag", () => {
    const bad = {
      ...callToActionTemplate,
      content: { root: { tag: "not-a-registered-tag", attributes: { id: "x" }, children: [] } },
    } as unknown
    expect(() => parseComponentTemplateDefinition(bad)).toThrow()
  })

  it("infers the ComponentTemplateDefinition type", () => {
    const declared: ComponentTemplateDefinition = callToActionTemplate
    expect(declared.id).toBe("call-to-action")
  })
})
