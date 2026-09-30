import type { z } from "zod"
import {
  draftResponseSchema,
  matchResponseSchema,
  refineResponseSchema,
  type DraftResponse,
  type MatchResponse,
  type PageRequest,
  type RefineResponse,
} from "./schema"
import type { AppNode } from "@/features/app-state"
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
  match: (request: PageRequest): Promise<MatchResponse> =>
    postJson("/api/prompt-assist/match", toBody(request), matchResponseSchema),
  draft: (request: PageRequest, templateId: string): Promise<DraftResponse> =>
    postJson("/api/prompt-assist/draft", { ...toBody(request), templateId }, draftResponseSchema),
  refine: (request: PageRequest, pages: ReadonlyArray<AppNode>): Promise<RefineResponse> =>
    postJson("/api/prompt-assist/refine", { ...toBody(request), page: describePage(pages) }, refineResponseSchema),
}
