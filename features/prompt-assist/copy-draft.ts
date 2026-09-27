import type { PageTemplateDefinition } from "@/features/templates"
import { promptDraftSchema, type PageBrief, type PromptDraft } from "./schema"
import { callOpenAiJson } from "./openai-client"

const PROMPT_FIELD_KEYS = ["name", "headline", "summary"] as const

function fieldDescription(template: PageTemplateDefinition, key: string): string {
  return template.dataMapping.fields.find((field) => field.source === key)?.description ?? key
}

function fallbackDraft(brief: PageBrief): PromptDraft {
  return { name: brief.name, headline: brief.headline }
}

/**
 * Drafts values for the template's "name" / "headline" / "summary" fields
 * from the user's prompt. Jev is not used here: it answers narrow typed
 * questions and does not produce prose, so drafting copy goes through a
 * small, cheap chat model instead (see openai-client.ts). Any failure
 * (missing key, network, bad JSON) degrades to the brief's own
 * deterministically extracted name/headline rather than erroring out.
 */
export async function generateCopyDraft(
  brief: PageBrief,
  template: PageTemplateDefinition,
): Promise<Readonly<{ draft: PromptDraft; source: "openai" | "fallback" }>> {
  const fieldLines = PROMPT_FIELD_KEYS.map((key) => `- ${key}: ${fieldDescription(template, key)}`).join("\n")

  const userPrompt = [
    `The user described the page they want: "${brief.rawPrompt}"`,
    brief.toneHints.length > 0 ? `Tone hints: ${brief.toneHints.join(", ")}` : "",
    brief.colorHints.length > 0 ? `Style hints: ${brief.colorHints.join(", ")}` : "",
    `The chosen template is "${template.metadata.name}" (${template.metadata.description}).`,
    `Write values for these fields:\n${fieldLines}`,
    `Keep "headline" under 12 words and "summary" under 60 words. Omit a key entirely if you have nothing useful to say for it.`,
  ]
    .filter(Boolean)
    .join("\n")

  try {
    const raw = await callOpenAiJson({
      system:
        "You write short, concrete website copy. Reply with a compact JSON object containing only the requested keys, as plain strings, with no markdown and no extra commentary.",
      user: userPrompt,
    })

    const parsed = promptDraftSchema.parse(raw)
    return {
      source: "openai",
      draft: {
        name: parsed.name ?? brief.name,
        headline: parsed.headline ?? brief.headline,
        summary: parsed.summary,
      },
    }
  } catch {
    return { source: "fallback", draft: fallbackDraft(brief) }
  }
}
