import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { pageTemplateRegistry } from "@/features/templates"
import {
  checkClientRateLimit,
  decideTemplateMatch,
  extractPageBrief,
  matchRequestSchema,
  matchResponseSchema,
  rateLimitedResponse,
} from "@/features/prompt-assist/server"

export async function POST(request: NextRequest) {
  const rateLimit = checkClientRateLimit(request, "match")
  if (!rateLimit.allowed) return rateLimitedResponse(rateLimit)

  const body = await request.json().catch(() => null)
  const parsedRequest = matchRequestSchema.safeParse(body)
  if (!parsedRequest.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const brief = extractPageBrief(parsedRequest.data.prompt)
  const { match, candidates } = await decideTemplateMatch(brief, pageTemplateRegistry)

  return NextResponse.json(matchResponseSchema.parse({ brief, match, candidates }))
}
