import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { pageTemplateRegistry } from "@/features/templates"
import { decideTemplateMatch, extractPageBrief, matchRequestSchema, matchResponseSchema } from "@/features/prompt-assist/server"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsedRequest = matchRequestSchema.safeParse(body)
  if (!parsedRequest.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const brief = extractPageBrief(parsedRequest.data.prompt)
  const { match, candidates } = await decideTemplateMatch(brief, pageTemplateRegistry)

  return NextResponse.json(matchResponseSchema.parse({ brief, match, candidates }))
}
