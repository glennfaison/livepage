import type { NextRequest } from "next/server"
import { getPageTemplateById } from "@/features/templates"
import {
  draftCopy,
  draftRequestSchema,
  draftResponseSchema,
  handlePromptAssistRequest,
  NotFoundError,
} from "@/features/prompt-assist/server"

export const POST = (request: NextRequest) =>
  handlePromptAssistRequest(request, {
    scope: "draft",
    schema: draftRequestSchema,
    responseSchema: draftResponseSchema,
    handle: async ({ templateId, ...pageRequest }) => {
      const template = getPageTemplateById(templateId)
      if (!template) throw new NotFoundError("Unknown template id")
      return draftCopy(pageRequest, template)
    },
  })
