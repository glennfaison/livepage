/** @jest-environment node */
import { NextRequest } from "next/server"
import { POST as matchPost } from "@/app/api/prompt-assist/match/route"
import { POST as draftPost } from "@/app/api/prompt-assist/draft/route"
import { POST as refinePost } from "@/app/api/prompt-assist/refine/route"
import { describePage } from "@/features/prompt-assist"
import { cloneTemplatePages, getPageTemplateById } from "@/features/templates"

const originalEnv = { ...process.env }
const originalFetch = global.fetch

beforeEach(() => {
  delete process.env.TYPESAFE_API_KEY
  delete process.env.OPENAI_API_KEY
  process.env.PROMPT_ASSIST_RATE_LIMIT_PER_MINUTE = "0"
  process.env.PROMPT_ASSIST_REFINE_RATE_LIMIT_PER_MINUTE = "0"
  global.fetch = jest.fn().mockRejectedValue(new Error("network must not be used")) as unknown as typeof fetch
})
afterEach(() => {
  process.env = { ...originalEnv }
  global.fetch = originalFetch
  jest.restoreAllMocks()
})

const post = (path: string, ip: string, body: unknown) =>
  new NextRequest(`http://x/api/prompt-assist/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  })

describe("prompt-assist routes", () => {
  it("match reports 'unavailable' when no provider is configured", async () => {
    const response = await matchPost(post("match", "1.1.1.1", { prompt: "a dark resume" }))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ kind: "unavailable" })
  })

  it.each([
    ["match", matchPost, { prompt: "   " }],
    ["match", matchPost, "not json"],
    ["match", matchPost, { prompt: "x", clarifications: [1, 2, 3].map((n) => ({ question: `q${n}`, answer: "a" })) }],
    ["draft", draftPost, { prompt: "x" }],
    ["refine", refinePost, { prompt: "x" }],
    ["refine", refinePost, { prompt: "x", page: { nodes: Array.from({ length: 151 }, (_, i) => ({ id: `n${i}`, tag: "row", settings: {} })), settings: {} } }],
  ])("%s rejects an invalid body with 400", async (path, handler, body) => {
    expect((await handler(post(path, "1.1.1.2", body))).status).toBe(400)
  })

  it("draft returns 404 for an unknown template and no copy without OpenAI", async () => {
    expect((await draftPost(post("draft", "1.1.1.3", { prompt: "x", templateId: "nope" }))).status).toBe(404)
    const ok = await draftPost(post("draft", "1.1.1.3", { prompt: "x", templateId: "landing-page-saas" }))
    expect(await ok.json()).toEqual({ values: {}, source: "none" })
  })

  it("refine takes a page description and, with no providers, returns done", async () => {
    const page = describePage(cloneTemplatePages(getPageTemplateById("landing-page-saas")!))
    const response = await refinePost(post("refine", "1.1.1.4", { prompt: "airy", page }))
    expect(await response.json()).toEqual({ satisfaction: null, done: true, edits: [] })
  })

  it("returns 429 with Retry-After past the per-minute limit, per client and per route", async () => {
    process.env.PROMPT_ASSIST_RATE_LIMIT_PER_MINUTE = "2"
    const send = (ip: string) => matchPost(post("match", ip, { prompt: "a dark resume" }))

    expect((await send("9.9.9.9")).status).toBe(200)
    expect((await send("9.9.9.9")).status).toBe(200)
    const limited = await send("9.9.9.9")
    expect(limited.status).toBe(429)
    expect(Number(limited.headers.get("retry-after"))).toBeGreaterThan(0)

    expect((await send("8.8.8.8")).status).toBe(200)
    expect((await draftPost(post("draft", "9.9.9.9", { prompt: "x", templateId: "landing-page-saas" }))).status).toBe(200)
  })

  it("never leaks provider or internal errors to the client", async () => {
    process.env.TYPESAFE_API_KEY = "k"
    jest.spyOn(console, "error").mockImplementation(() => undefined)
    jest.spyOn(console, "warn").mockImplementation(() => undefined)
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => { throw new Error("secret-detail") } }) as unknown as typeof fetch
    const response = await matchPost(post("match", "7.7.7.7", { prompt: "a dark resume" }))
    expect(JSON.stringify(await response.json())).not.toContain("secret-detail")
  })
})
