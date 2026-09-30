/** @jest-environment node */
import { askJev, isJevConfigured, JevUnavailableError } from "@/lib/jev"

const originalFetch = global.fetch
const originalEnv = { ...process.env }

function mockFetch(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const fetchMock = jest.fn().mockResolvedValue({ ok: init.ok ?? true, status: init.status ?? 200, json: async () => body })
  global.fetch = fetchMock as unknown as typeof fetch
  return fetchMock
}

const questions = {
  template: { type: "choice", instructions: "Which?", criteria: { a: "A", none: "None" } },
  ready: { type: "noul", instructions: "Ready?" },
} as const

beforeEach(() => {
  process.env.TYPESAFE_API_KEY = "test-key"
  delete process.env.TYPESAFE_CALLS_PER_MINUTE
})

afterEach(() => {
  global.fetch = originalFetch
  process.env = { ...originalEnv }
})

describe("askJev", () => {
  it("posts state and questions to /v1/systemone and returns typed answers", async () => {
    const fetchMock = mockFetch({
      answers: {
        template: { type: "choice", choice: "a", probabilities: { a: 0.9, none: 0.1 }, confidence: 0.8 },
        ready: { type: "noul", noul: 0.25 },
      },
    })
    const answers = await askJev({ state: { x: 1 }, questions })

    expect(answers.template.choice).toBe("a")
    expect(answers.ready.noul).toBe(0.25)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("https://api.typesafe.ai/v1/systemone")
    expect(init.headers.Authorization).toBe("Bearer test-key")
    expect(JSON.parse(init.body)).toMatchObject({ model: "jev-latest", state: { x: 1 }, questions })
  })

  it("tolerates a missing probabilities/confidence on a choice answer", async () => {
    mockFetch({ answers: { template: { type: "choice", choice: "a" }, ready: { type: "noul", noul: 1 } } })
    const answers = await askJev({ state: {}, questions })
    expect(answers.template).toMatchObject({ choice: "a", probabilities: {}, confidence: 0 })
  })

  it.each([
    ["an HTTP error", { ok: false, status: 503 }, {}],
    ["a body without answers", {}, { answers: "nope" }],
    ["an answer of the wrong kind", {}, { answers: { template: { type: "noul", noul: 1 }, ready: { type: "noul", noul: 1 } } }],
    ["a missing answer", {}, { answers: { template: { type: "choice", choice: "a" } } }],
  ])("raises JevUnavailableError on %s", async (_label, init, body) => {
    mockFetch(body, init)
    await expect(askJev({ state: {}, questions })).rejects.toBeInstanceOf(JevUnavailableError)
  })

  it("raises JevUnavailableError when the network fails", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("down")) as unknown as typeof fetch
    await expect(askJev({ state: {}, questions })).rejects.toBeInstanceOf(JevUnavailableError)
  })

  it("does not call the network without a key", async () => {
    delete process.env.TYPESAFE_API_KEY
    const fetchMock = mockFetch({})
    expect(isJevConfigured()).toBe(false)
    await expect(askJev({ state: {}, questions })).rejects.toBeInstanceOf(JevUnavailableError)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("stops calling the provider once its per-minute budget is spent", async () => {
    process.env.TYPESAFE_CALLS_PER_MINUTE = "1"
    const fetchMock = mockFetch({ answers: { ready: { type: "noul", noul: 0.5 } } })
    const noulOnly = { ready: questions.ready }
    await askJev({ state: {}, questions: noulOnly })
    await expect(askJev({ state: {}, questions: noulOnly })).rejects.toBeInstanceOf(JevUnavailableError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
