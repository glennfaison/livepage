/** @jest-environment node */
import { NextRequest } from "next/server"
import { pageTemplateRegistry } from "@/features/templates"
import { extractPageBrief } from "@/features/prompt-assist"
import { decideTemplateMatch } from "@/features/prompt-assist/server"
import { createRateLimiter, getClientKey } from "@/features/prompt-assist/rate-limit"
import { POST as matchPost } from "@/app/api/prompt-assist/match/route"
import { POST as draftPost } from "@/app/api/prompt-assist/draft/route"

const originalFetch = global.fetch
const originalEnv = { ...process.env }

afterEach(() => {
  global.fetch = originalFetch
  process.env = { ...originalEnv }
  jest.restoreAllMocks()
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

describe("getClientKey", () => {
  it("uses the first X-Forwarded-For hop, then X-Real-IP, then a shared bucket", () => {
    const req = (headers: Record<string, string>) => new Request("http://x", { headers })
    expect(getClientKey(req({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" }))).toBe("1.1.1.1")
    expect(getClientKey(req({ "x-real-ip": "3.3.3.3" }))).toBe("3.3.3.3")
    expect(getClientKey(req({}))).toBe("unknown")
  })
})

function postJson(url: string, ip: string, body: unknown) {
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  })
}

describe("API routes", () => {
  it("returns 429 with Retry-After once a client exceeds the per-minute limit", async () => {
    process.env.PROMPT_ASSIST_RATE_LIMIT_PER_MINUTE = "2"
    delete process.env.TYPESAFE_API_KEY
    const send = () => matchPost(postJson("http://x/api/prompt-assist/match", "10.0.0.1", { prompt: "a dark resume site" }))

    expect((await send()).status).toBe(200)
    expect((await send()).status).toBe(200)
    const limited = await send()
    expect(limited.status).toBe(429)
    expect(Number(limited.headers.get("retry-after"))).toBeGreaterThan(0)

    // A different client is unaffected.
    const other = await matchPost(postJson("http://x/api/prompt-assist/match", "10.0.0.2", { prompt: "a dark resume site" }))
    expect(other.status).toBe(200)
  })

  it("limits the draft route separately and rejects before touching the provider", async () => {
    process.env.PROMPT_ASSIST_RATE_LIMIT_PER_MINUTE = "1"
    process.env.OPENAI_API_KEY = "test-key"
    const fetchMock = jest.fn().mockRejectedValue(new Error("network down"))
    global.fetch = fetchMock as unknown as typeof fetch
    jest.spyOn(console, "warn").mockImplementation(() => undefined)
    const send = () =>
      draftPost(postJson("http://x/api/prompt-assist/draft", "10.0.0.3", { prompt: "a resume", templateId: "cv-resume-personal-website" }))

    expect((await send()).status).toBe(200)
    expect((await send()).status).toBe(429)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("can be disabled with 0", async () => {
    process.env.PROMPT_ASSIST_RATE_LIMIT_PER_MINUTE = "0"
    for (let i = 0; i < 5; i += 1) {
      const res = await matchPost(postJson("http://x/api/prompt-assist/match", "10.0.0.4", { prompt: "a dark resume site" }))
      expect(res.status).toBe(200)
    }
  })
})

describe("provider budget", () => {
  it("degrades to the deterministic fallback instead of calling Jev once the budget is spent", async () => {
    process.env.TYPESAFE_API_KEY = "test-key"
    process.env.PROMPT_ASSIST_PROVIDER_BUDGET_PER_MINUTE = "1"
    jest.spyOn(console, "warn").mockImplementation(() => undefined)
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ answers: { template: { type: "choice", choice: "agency-homepage", confidence: 0.9 } } }),
    })
    global.fetch = fetchMock as unknown as typeof fetch

    const brief = extractPageBrief("case studies") // near-tie, so it reaches Jev
    const first = await decideTemplateMatch(brief, pageTemplateRegistry)
    const second = await decideTemplateMatch(brief, pageTemplateRegistry)

    expect(first.match.decidedBy).toBe("jev")
    expect(second.match.decidedBy).toBe("jev-unavailable")
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
