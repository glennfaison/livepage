import type { z } from "zod"
import {
  draftResponseSchema,
  matchResponseSchema,
  refineResponseSchema,
  type DraftTemplate,
  type MatchRequest,
  type DraftResponse,
  type MatchResponse,
  type PageRequest,
  type RefineResponse,
} from "@/shared/features/prompt-assist"
import type { AppNode } from "@/client/features/app-state"
import { listTemplateTextFields, type PageTemplateDefinition } from "@/client/features/templates"
import { describePage } from "./page-description"

export class RateLimitedError extends Error {
  constructor() {
    super("Rate limited")
    this.name = "RateLimitedError"
  }
}

async function postJson<S extends z.ZodType>(url: string, body: unknown, responseSchema: S): Promise<z.output<S>> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (response.status === 429) throw new RateLimitedError()
  if (!response.ok) throw new Error(`Request to ${url} failed with ${response.status}`)
  return responseSchema.parse(await response.json())
}

const toBody = (request: PageRequest) => ({ prompt: request.prompt, clarifications: request.clarifications })

export const promptAssistApi = {
  match: (request: PageRequest, catalog: MatchRequest["catalog"]): Promise<MatchResponse> =>
    postJson("/api/prompt-assist/match", { ...toBody(request), catalog }, matchResponseSchema),
  draft: (request: PageRequest, template: PageTemplateDefinition): Promise<DraftResponse> => {
    const templateRequest: DraftTemplate = {
      name: template.metadata.name,
      description: template.metadata.description,
      fields: listTemplateTextFields(template),
    }
    return postJson("/api/prompt-assist/draft", { ...toBody(request), template: templateRequest }, draftResponseSchema)
  },
  refine: (request: PageRequest, pages: ReadonlyArray<AppNode>): Promise<RefineResponse> =>
    postJson("/api/prompt-assist/refine", { ...toBody(request), page: describePage(pages) }, refineResponseSchema),
}
