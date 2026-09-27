import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getPageTemplateById } from "@/features/templates"
import { draftRequestSchema, draftResponseSchema } from "@/features/prompt-assist"
import { generateCopyDraft } from "@/features/prompt-assist/server"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsedRequest = draftRequestSchema.safeParse(body)
  if (!parsedRequest.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const template = getPageTemplateById(parsedRequest.data.templateId)
  if (!template) {
    return NextResponse.json({ error: "Unknown template id" }, { status: 404 })
  }

  const result = await generateCopyDraft(parsedRequest.data.brief, template)
  return NextResponse.json(draftResponseSchema.parse(result))
}
