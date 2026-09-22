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

const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 12
const requestBuckets = new Map<string, { count: number; resetAt: number }>()

function requestKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin")
    const host = request.headers.get("host")
    if (origin && host && new URL(origin).host !== host) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const now = Date.now()
    const key = requestKey(request)
    const bucket = requestBuckets.get(key)
    if (!bucket || bucket.resetAt <= now) {
      requestBuckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    } else if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(Math.ceil((bucket.resetAt - now) / 1000)) } })
    } else {
      bucket.count += 1
    }
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
