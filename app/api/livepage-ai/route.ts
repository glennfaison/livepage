import { NextResponse } from "next/server"
import { ZodError } from "zod"
import {
  livePageAIRequestSchema,
  livePageAIResponseSchema,
} from "@/features/livepage-ai/contracts"
import {
  LivePageAIServiceError,
  MissingTypesafeApiKeyError,
  planLivePageAI,
} from "@/features/livepage-ai/service"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const input = livePageAIRequestSchema.parse(await request.json())
    const response = livePageAIResponseSchema.parse(await planLivePageAI(input))
    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }
    if (error instanceof MissingTypesafeApiKeyError) {
      return NextResponse.json({ error: "AI service is not configured" }, { status: 503 })
    }
    if (error instanceof LivePageAIServiceError) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 })
    }
    return NextResponse.json({ error: "Request could not be processed" }, { status: 500 })
  }
}
