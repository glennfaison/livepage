/** @jest-environment node */
import { createEnvRateLimiter, createRateLimiter, getClientKey } from "@/lib/rate-limit"

const originalEnv = { ...process.env }
afterEach(() => {
  process.env = { ...originalEnv }
})

describe("createRateLimiter", () => {
  it("allows up to the limit, then reports when to retry", () => {
    let time = 0
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000, now: () => time })
    expect(limiter.check("a")).toEqual({ allowed: true })
    time = 10_000
    expect(limiter.check("a")).toEqual({ allowed: true })
    time = 20_000
    expect(limiter.check("a")).toEqual({ allowed: false, retryAfterSeconds: 40 })
  })

  it("frees capacity as the window slides and tracks keys independently", () => {
    let time = 0
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now: () => time })
    expect(limiter.check("a").allowed).toBe(true)
    expect(limiter.check("b").allowed).toBe(true)
    expect(limiter.check("a").allowed).toBe(false)
    time = 1000
    expect(limiter.check("a").allowed).toBe(true)
  })

  it("bounds memory by evicting the least recently used keys", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 2, now: () => 0 })
    limiter.check("a")
    limiter.check("b")
    limiter.check("c") // evicts "a"
    expect(limiter.check("a").allowed).toBe(true)
    expect(limiter.check("c").allowed).toBe(false)
  })
})

describe("createEnvRateLimiter", () => {
  it("reads its limit from the environment on every check and treats 0 as disabled", () => {
    const limiter = createEnvRateLimiter("TEST_LIMIT", 1)
    expect(limiter.check("a").allowed).toBe(true)
    expect(limiter.check("a").allowed).toBe(false)

    process.env.TEST_LIMIT = "0"
    expect(limiter.check("a").allowed).toBe(true)
    expect(limiter.check("a").allowed).toBe(true)
  })

  it("falls back to the default for a malformed value", () => {
    process.env.TEST_LIMIT_BAD = "lots"
    const limiter = createEnvRateLimiter("TEST_LIMIT_BAD", 1)
    limiter.check("a")
    expect(limiter.check("a").allowed).toBe(false)
  })
})

describe("getClientKey", () => {
  it("uses the first X-Forwarded-For hop, then X-Real-IP, then a shared bucket", () => {
    const req = (headers: Record<string, string>) => new Request("http://x", { headers })
    expect(getClientKey(req({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" }))).toBe("1.1.1.1")
    expect(getClientKey(req({ "x-real-ip": "3.3.3.3" }))).toBe("3.3.3.3")
    expect(getClientKey(req({}))).toBe("unknown")
  })
})
