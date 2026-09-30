import { z } from "zod"
import { completeJson, isOpenAiConfigured, OpenAiUnavailableError } from "@/lib/openai"
import { listTemplateTextFields, type PageTemplateDefinition } from "@/features/templates"
import { describeRequest } from "./request"
import type { DraftResponse, PageRequest } from "./schema"

const MAX_VALUE_LENGTH = 600

/**
 * Drafts values for every free-text slot the template declares in its own
 * `dataMapping` (whatever those slots are named), so no field list lives
 * here. Without a configured model, or on any model failure, no copy is
 * drafted and the template's own placeholder text stays in place.
 */
export async function draftCopy(request: PageRequest, template: PageTemplateDefinition): Promise<DraftResponse> {
  const fields = listTemplateTextFields(template)
  if (fields.length === 0 || !isOpenAiConfigured()) return { values: {}, source: "none" }

  const schema = z.object(Object.fromEntries(fields.map((field) => [field.source, z.string().max(MAX_VALUE_LENGTH)])))
  try {
    const values = await completeJson({
      system:
        "You write short, concrete website copy. Fill each requested field as a plain string with no markdown. Use an empty string for a field the request gives you nothing to say about; never invent personal facts such as employers or contact details.",
      user: [
        `The person described the page they want:\n${describeRequest(request)}`,
        `The chosen template is "${template.metadata.name}": ${template.metadata.description}`,
        `Fields:\n${fields.map((field) => `- ${field.source}: ${field.description}`).join("\n")}`,
        "Keep single-line fields under 12 words and longer summaries under 60 words.",
      ].join("\n\n"),
      schemaName: "template_copy",
      schema,
    })
    return { values, source: "openai" }
  } catch (error) {
    if (!(error instanceof OpenAiUnavailableError)) throw error
    console.warn("[prompt-assist] copy draft failed, leaving template text:", error.message)
    return { values: {}, source: "none" }
  }
}
