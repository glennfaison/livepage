import type { NextRequest } from "next/server"
import {
  draftCopy,
  draftRequestSchema,
  draftResponseSchema,
  handlePromptAssistRequest,
} from "@/server/features/prompt-assist"

export const POST = (request: NextRequest) =>
  handlePromptAssistRequest(request, {
    scope: "draft",
    schema: draftRequestSchema,
    responseSchema: draftResponseSchema,
    handle: async ({ pageTemplate, ...pageRequest }) => draftCopy(pageRequest, pageTemplate),
  })
