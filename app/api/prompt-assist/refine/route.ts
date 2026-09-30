import type { NextRequest } from "next/server"
import { handlePromptAssistRequest, refineDesign, refineRequestSchema, refineResponseSchema } from "@/features/prompt-assist/server"

export const POST = (request: NextRequest) =>
  handlePromptAssistRequest(request, {
    scope: "refine",
    schema: refineRequestSchema,
    responseSchema: refineResponseSchema,
    handle: ({ page, ...pageRequest }) => refineDesign(pageRequest, page),
  })
