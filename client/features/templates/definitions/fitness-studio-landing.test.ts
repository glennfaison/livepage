import { parsePageTemplateDefinition } from "@/client/features/templates/schema"
import { fitnessStudioTemplate } from "./fitness-studio-landing"

describe("fitness-studio-landing template", () => {
  it("parses as a valid PageTemplateDefinition", () => {
    const parsed = parsePageTemplateDefinition(fitnessStudioTemplate)

    expect(parsed.id).toBe("fitness-studio-landing")
    expect(parsed.metadata.name).toBe("Fitness Studio")
    expect(parsed.metadata.category).toBe("Health & Fitness")
    expect(parsed.metadata.tags).toContain("fitness")
    expect(parsed.metadata.thumbnail).toBe("/template-thumbnails/fitness-studio-landing.svg")
    expect(parsed.dataMapping.source).toBe("linkedin-profile")
    expect(parsed.dataMapping.fields.length).toBeGreaterThan(0)
    expect(parsed.content.pages.length).toBeGreaterThan(0)
  })
})
