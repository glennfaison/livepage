import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getPageTemplateById } from "@/features/templates"
import { draftRequestSchema, draftResponseSchema, extractPageBrief, generateCopyDraft } from "@/features/prompt-assist/server"

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

  // Re-derive the brief server-side instead of trusting a client-supplied one.
  const brief = extractPageBrief(parsedRequest.data.prompt)
  const result = await generateCopyDraft(brief, template)
  return NextResponse.json(draftResponseSchema.parse(result))
}
