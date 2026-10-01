import { z } from "zod"
import { completeJson, isOpenAiConfigured, OpenAiUnavailableError } from "@/server/services/openai"
import { describeRequest } from "./request"
import type { DraftResponse, DraftTemplate, PageRequest } from "@/shared/features/prompt-assist/contract/schema"

const MAX_VALUE_LENGTH = 600

/**
 * Drafts values for every writable free-text slot supplied for the selected
 * template. Without a configured model, or on any model failure, no copy is
 * drafted and the template's own placeholder text stays in place.
 */
export async function draftCopy(request: PageRequest, template: DraftTemplate): Promise<DraftResponse> {
  const fields = template.fields
  if (fields.length === 0 || !isOpenAiConfigured()) return { values: {}, source: "none" }

  const schema = z.object(Object.fromEntries(fields.map((field) => [field.source, z.string().max(MAX_VALUE_LENGTH)])))
  try {
    const values = await completeJson({
      system:
        "You write short, concrete website copy. Fill each requested field as a plain string with no markdown. Use an empty string for a field the request gives you nothing to say about; never invent personal facts such as employers or contact details.",
      user: [
        `The person described the page they want:\n${describeRequest(request)}`,
        `The chosen template is "${template.name}": ${template.description}`,
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
