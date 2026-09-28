/** @jest-environment node */
import { pageTemplateRegistry, getPageTemplateById } from "@/features/templates"
import { extractPageBrief } from "@/features/prompt-assist"
import { decideTemplateMatch, generateCopyDraft } from "@/features/prompt-assist/server"

const originalFetch = global.fetch
const originalEnv = { ...process.env }

function mockFetchOnce(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  })
  global.fetch = fetchMock as unknown as typeof fetch
  return fetchMock
}

afterEach(() => {
  global.fetch = originalFetch
  process.env = { ...originalEnv }
  jest.restoreAllMocks()
})

// "case studies" ties portfolio-personal-site and agency-homepage, so it always reaches Jev.
const ambiguousBrief = () => extractPageBrief("case studies")

describe("decideTemplateMatch with Jev configured", () => {
  beforeEach(() => {
    process.env.TYPESAFE_API_KEY = "test-key"
    jest.spyOn(console, "warn").mockImplementation(() => undefined)
  })

  it("uses Jev's choice and clamps an out-of-range confidence", async () => {
    mockFetchOnce({ answers: { template: { type: "choice", choice: "agency-homepage", confidence: 7 } } })
    const { match } = await decideTemplateMatch(ambiguousBrief(), pageTemplateRegistry)
    expect(match).toEqual({ templateId: "agency-homepage", confidence: 1, decidedBy: "jev" })
  })

  it("survives a Jev answer with a missing confidence instead of throwing", async () => {
    mockFetchOnce({ answers: { template: { type: "choice", choice: "agency-homepage" } } })
    const { match } = await decideTemplateMatch(ambiguousBrief(), pageTemplateRegistry)
    expect(match).toMatchObject({ templateId: "agency-homepage", decidedBy: "jev", confidence: 0 })
  })

  it("ignores a choice outside the shortlist and falls back", async () => {
    mockFetchOnce({ answers: { template: { type: "choice", choice: "not-a-template", confidence: 0.9 } } })
    const { match, candidates } = await decideTemplateMatch(ambiguousBrief(), pageTemplateRegistry)
    expect(match.decidedBy).toBe("jev-unavailable")
    expect(candidates.some((candidate) => candidate.templateId === match.templateId)).toBe(true)
  })

  it.each([
    ["an HTTP error", { ok: false, status: 503 }, {}],
    ["a malformed body", {}, { answers: "nope" }],
  ])("falls back on %s", async (_label, init, body) => {
    mockFetchOnce(body, init)
    const { match } = await decideTemplateMatch(ambiguousBrief(), pageTemplateRegistry)
    expect(match.decidedBy).toBe("jev-unavailable")
  })
})

describe("generateCopyDraft with OpenAI configured", () => {
  const template = () => getPageTemplateById("cv-resume-personal-website")!
  const brief = () => extractPageBrief('A page for "Priya Shah", I am a backend engineer')

  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-key"
    jest.spyOn(console, "warn").mockImplementation(() => undefined)
  })

  it("does not send `temperature` (GPT-5 models reject non-default values)", async () => {
    const fetchMock = mockFetchOnce({ choices: [{ message: { content: JSON.stringify({ headline: "Backend engineer" }) } }] })
    const result = await generateCopyDraft(brief(), template())
    expect(result.source).toBe("openai")
    const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(sentBody).not.toHaveProperty("temperature")
    expect(result.draft.name).toBe("Priya Shah")
  })

  it("falls back (and logs) when the model returns over-long copy", async () => {
    mockFetchOnce({ choices: [{ message: { content: JSON.stringify({ summary: "x".repeat(5000) }) } }] })
    const result = await generateCopyDraft(brief(), template())
    expect(result.source).toBe("fallback")
    expect(console.warn).toHaveBeenCalled()
  })
})
