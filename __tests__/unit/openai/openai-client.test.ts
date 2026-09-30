/** @jest-environment node */
import { z } from "zod"
import { completeJson, isOpenAiConfigured, OpenAiUnavailableError } from "@/features/openai"

const originalFetch = global.fetch
const originalEnv = { ...process.env }
const schema = z.object({ headline: z.string().max(20), tags: z.array(z.string()).max(3) })

function mockReply(content: unknown, init: { ok?: boolean; status?: number } = {}) {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => ({ choices: [{ message: { content: typeof content === "string" ? content : JSON.stringify(content) } }] }),
  })
  global.fetch = fetchMock as unknown as typeof fetch
  return fetchMock
}

const call = () => completeJson({ system: "s", user: "u", schema, schemaName: "test_schema" })

beforeEach(() => {
  process.env.OPENAI_API_KEY = "test-key"
  delete process.env.OPENAI_CALLS_PER_MINUTE
})
afterEach(() => {
  global.fetch = originalFetch
  process.env = { ...originalEnv }
})

describe("completeJson", () => {
  it("returns the schema-validated reply", async () => {
    mockReply({ headline: "Hi", tags: ["a"] })
    await expect(call()).resolves.toEqual({ headline: "Hi", tags: ["a"] })
  })

  it("sends a strict json_schema without validation keywords OpenAI rejects, and no temperature", async () => {
    const fetchMock = mockReply({ headline: "Hi", tags: [] })
    await call()
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body).not.toHaveProperty("temperature")
    expect(body.response_format.json_schema).toMatchObject({ name: "test_schema", strict: true })
    const wire = JSON.stringify(body.response_format.json_schema.schema)
    expect(wire).not.toMatch(/maxLength|maxItems|\$schema/)
    expect(body.response_format.json_schema.schema.required).toEqual(["headline", "tags"])
  })

  it("treats a reply that violates the schema's limits as unavailable", async () => {
    mockReply({ headline: "x".repeat(50), tags: [] })
    await expect(call()).rejects.toBeInstanceOf(OpenAiUnavailableError)
  })

  it.each([
    ["an HTTP error", () => mockReply({}, { ok: false, status: 500 })],
    ["non-JSON content", () => mockReply("not json")],
    ["a missing message", () => (global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [] }) }) as unknown as typeof fetch)],
    ["a network error", () => (global.fetch = jest.fn().mockRejectedValue(new Error("down")) as unknown as typeof fetch)],
  ])("raises OpenAiUnavailableError on %s", async (_label, arrange) => {
    arrange()
    await expect(call()).rejects.toBeInstanceOf(OpenAiUnavailableError)
  })

  it("does not call the network without a key", async () => {
    delete process.env.OPENAI_API_KEY
    const fetchMock = mockReply({})
    expect(isOpenAiConfigured()).toBe(false)
    await expect(call()).rejects.toBeInstanceOf(OpenAiUnavailableError)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("uses OPENAI_MODEL or an explicit model override", async () => {
    process.env.OPENAI_MODEL = "custom-model"
    const fetchMock = mockReply({ headline: "Hi", tags: [] })
    await call()
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).model).toBe("custom-model")
  })
})
