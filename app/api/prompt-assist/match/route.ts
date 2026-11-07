import type { NextRequest } from "next/server"
import { handlePromptAssistRequest, matchRequestSchema, matchResponseSchema, matchPageTemplate } from "@/server/features/prompt-assist"

export const POST = (request: NextRequest) =>
  handlePromptAssistRequest(request, { scope: "match", schema: matchRequestSchema, handle: matchPageTemplate, responseSchema: matchResponseSchema })
