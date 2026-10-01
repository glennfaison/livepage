import type { NextRequest } from "next/server"
import { handlePromptAssistRequest, matchRequestSchema, matchResponseSchema, matchTemplate } from "@/server/features/prompt-assist"

export const POST = (request: NextRequest) =>
  handlePromptAssistRequest(request, { scope: "match", schema: matchRequestSchema, handle: matchTemplate, responseSchema: matchResponseSchema })
