import type { NextRequest } from "next/server"
import { getPageTemplateById } from "@/shared/features/templates/catalog"
import {
  draftCopy,
  draftRequestSchema,
  draftResponseSchema,
  handlePromptAssistRequest,
  NotFoundError,
} from "@/server/features/prompt-assist"

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
