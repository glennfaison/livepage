import "server-only"

/**
 * Dependency-free, in-memory rate limiting shared by server-side code.
 *
 * State lives in this process's memory. On serverless platforms each warm
 * instance keeps its own counters, so treat limits as best-effort protection
 * against abuse and runaway cost, not a hard quota. For a strict limit, back
 * `createRateLimiter` with a shared store (for example Redis) behind the same
 * `check(key)` interface.
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

function readIntegerEnv(name: string, fallback: number): number {
  const raw = process.env[name]
  if (raw === undefined || raw.trim() === "") return fallback
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? Math.floor(parsed) : fallback
}

/**
 * A per-minute limiter whose limit is read from the environment variable
 * `envName` on every check, so edits (and tests) take effect without a
 * restart. A limit of 0 or less disables it.
 */
export function createEnvRateLimiter(envName: string, defaultLimit: number): RateLimiter {
  let current: Readonly<{ limit: number; limiter: RateLimiter }> | null = null

  return {
    check(key) {
      const limit = readIntegerEnv(envName, defaultLimit)
      if (limit <= 0) return { allowed: true }
      if (current?.limit !== limit) current = { limit, limiter: createRateLimiter({ limit, windowMs: WINDOW_MS }) }
      return current.limiter.check(key)
    },
  }
}

/**
 * Identifies the caller by the first hop of X-Forwarded-For (set by the
 * hosting platform's proxy), then X-Real-IP. Callers with neither share one
 * bucket, which errs on the side of limiting. Behind a proxy that does not
 * overwrite X-Forwarded-For, clients can spoof this header.
 */
export function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown"
}

export function rateLimitedResponse(denied: RateLimitDenied): Response {
  return Response.json(
    { error: "Too many requests. Please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(denied.retryAfterSeconds) } },
  )
}
