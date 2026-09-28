/**
 * Server-only, dependency-free rate limiting for the prompt-assist API.
 *
 * Two independent protections, both configurable through the environment
 * (see .env.example; a value of 0 disables that protection):
 *
 * 1. Per-client limit (PROMPT_ASSIST_RATE_LIMIT_PER_MINUTE): each caller may
 *    hit each route only N times per minute; excess requests get a 429.
 * 2. Provider budget (PROMPT_ASSIST_PROVIDER_BUDGET_PER_MINUTE): a global cap
 *    on outbound TypeSafe / OpenAI calls. Exhausting it does not fail the
 *    request; the call is treated like an unavailable provider, so the chat
 *    keeps working on the free deterministic path.
 *
 * State lives in this process's memory. On serverless platforms each warm
 * instance keeps its own counters, so treat these limits as best-effort
 * protection against abuse and runaway cost, not a hard quota. For a strict
 * limit, back `createRateLimiter` with a shared store (for example Redis)
 * behind the same `check(key)` interface, and set a spend cap on the
 * provider accounts.
 */

export type RateLimitResult = Readonly<{ allowed: true } | { allowed: false; retryAfterSeconds: number }>
export type RateLimitDenied = Extract<RateLimitResult, { allowed: false }>

export type RateLimiter = Readonly<{ check: (key: string) => RateLimitResult }>

/** Sliding-window-log limiter: at most `limit` hits per `windowMs` per key. */
export function createRateLimiter(
  config: Readonly<{ limit: number; windowMs: number; maxKeys?: number; now?: () => number }>,
): RateLimiter {
  const { limit, windowMs, maxKeys = 5_000, now = Date.now } = config
  const hits = new Map<string, number[]>()

  function dropExpiredKeys(currentTime: number) {
    for (const [key, timestamps] of hits) {
      const last = timestamps[timestamps.length - 1]
      if (last === undefined || currentTime - last >= windowMs) hits.delete(key)
    }
  }

  return {
    check(key) {
      const currentTime = now()
      const recent = (hits.get(key) ?? []).filter((timestamp) => currentTime - timestamp < windowMs)

      if (recent.length >= limit) {
        hits.set(key, recent)
        const oldest = recent[0] ?? currentTime
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - currentTime) / 1000)) }
      }

      recent.push(currentTime)
      // Re-insert so Map iteration order approximates least-recently-used.
      hits.delete(key)
      hits.set(key, recent)

      if (hits.size > maxKeys) {
        dropExpiredKeys(currentTime)
        while (hits.size > maxKeys) {
          const oldestKey = hits.keys().next().value
          if (oldestKey === undefined) break
          hits.delete(oldestKey)
        }
      }
      return { allowed: true }
    },
  }
}

const WINDOW_MS = 60_000
const DEFAULT_CLIENT_LIMIT_PER_MINUTE = 20
const DEFAULT_PROVIDER_BUDGET_PER_MINUTE = 120

function readLimit(name: string, fallback: number): number {
  const raw = process.env[name]
  if (raw === undefined || raw.trim() === "") return fallback
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? Math.floor(parsed) : fallback
}

// Rebuilt whenever the configured limit changes, so env edits (and tests)
// take effect without a restart.
const limiters = new Map<string, Readonly<{ limit: number; limiter: RateLimiter }>>()

function limiterFor(scope: string, limit: number): RateLimiter | null {
  if (limit <= 0) return null
  const existing = limiters.get(scope)
  if (existing?.limit === limit) return existing.limiter
  const limiter = createRateLimiter({ limit, windowMs: WINDOW_MS })
  limiters.set(scope, { limit, limiter })
  return limiter
}

/**
 * Identifies the caller by the first hop of X-Forwarded-For (set by the
 * hosting platform's proxy), then X-Real-IP. Callers with neither share one
 * bucket, which errs on the side of limiting. If you deploy behind a proxy
 * that does not overwrite X-Forwarded-For, clients can spoof it.
 */
export function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown"
}

export function checkClientRateLimit(request: Request, scope: "match" | "draft"): RateLimitResult {
  const limit = readLimit("PROMPT_ASSIST_RATE_LIMIT_PER_MINUTE", DEFAULT_CLIENT_LIMIT_PER_MINUTE)
  const limiter = limiterFor(`client:${scope}`, limit)
  return limiter ? limiter.check(getClientKey(request)) : { allowed: true }
}

/** Returns false when the global outbound budget for `provider` is spent. */
export function consumeProviderBudget(provider: "jev" | "openai"): boolean {
  const limit = readLimit("PROMPT_ASSIST_PROVIDER_BUDGET_PER_MINUTE", DEFAULT_PROVIDER_BUDGET_PER_MINUTE)
  const limiter = limiterFor(`provider:${provider}`, limit)
  return limiter ? limiter.check("global").allowed : true
}

export function rateLimitedResponse(denied: RateLimitDenied): Response {
  return Response.json(
    { error: "Too many requests. Please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(denied.retryAfterSeconds) } },
  )
}
