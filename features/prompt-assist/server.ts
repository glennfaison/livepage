import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { z } from "zod"
import { createEnvRateLimiter, getClientKey, rateLimitedResponse } from "@/lib/rate-limit"
import { isPromptAssistEnabled } from "./feature-flag"

// Server-only entry point of the prompt-assist module. ./index is the
// client-safe barrel; route handlers under app/api/prompt-assist/** import
// only from this file so the client barrel never enters the server graph.
export { matchTemplate } from "./match-template"
export { draftCopy } from "./draft-copy"
export { refineDesign } from "./refine-design"
export * from "./schema"

const limiters = {
  match: createEnvRateLimiter("PROMPT_ASSIST_RATE_LIMIT_PER_MINUTE", 20),
  draft: createEnvRateLimiter("PROMPT_ASSIST_RATE_LIMIT_PER_MINUTE", 20),
  // One assist run makes several refine calls, so this route gets a larger allowance.
  refine: createEnvRateLimiter("PROMPT_ASSIST_REFINE_RATE_LIMIT_PER_MINUTE", 60),
}

/**
 * Shared shape of every prompt-assist route: the feature flag (404 when off,
 * before anything else runs), per-client rate limit, JSON body validation,
 * the handler, and a generic 500 that never leaks provider errors.
 */
export async function handlePromptAssistRequest<S extends z.ZodType, R>(
  request: NextRequest,
  route: Readonly<{
    scope: keyof typeof limiters
    schema: S
    handle: (input: z.output<S>) => Promise<R>
    responseSchema: z.ZodType<R>
  }>,
): Promise<Response> {
  if (!isPromptAssistEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const rateLimit = limiters[route.scope].check(getClientKey(request))
  if (!rateLimit.allowed) return rateLimitedResponse(rateLimit)

  const parsed = route.schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 })

  try {
    return NextResponse.json(route.responseSchema.parse(await route.handle(parsed.data)))
  } catch (error) {
    if (error instanceof NotFoundError) return NextResponse.json({ error: error.message }, { status: 404 })
    console.error(`[prompt-assist] ${route.scope} failed:`, error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

/** Thrown by route handlers when a referenced resource (such as a template id) does not exist. */
export class NotFoundError extends Error {}
