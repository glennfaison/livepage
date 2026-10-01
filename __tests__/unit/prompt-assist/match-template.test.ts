/** @jest-environment node */
import { describeTemplateCatalog, pageTemplateRegistry } from "@/client/features/templates/catalog"

import { mockAskJev, mockCompleteJson, mockIsJevConfigured, mockIsOpenAiConfigured, resetProviderMocks } from "../../utils/ai-provider-mocks"

jest.mock("@/server/services/jev", () => jest.requireActual("../../utils/ai-provider-mocks").jevModuleMock)
jest.mock("@/server/services/openai", () => jest.requireActual("../../utils/ai-provider-mocks").openAiModuleMock)

import { JevUnavailableError } from "@/server/services/jev"
import { OpenAiUnavailableError } from "@/server/services/openai"
import { matchTemplate } from "@/server/features/prompt-assist"

const ids = pageTemplateRegistry.map((template) => template.id)
const catalog = describeTemplateCatalog()
const request = (extra: object = {}) => ({ prompt: "a dark resume site", clarifications: [], catalog, ...extra })

/** A Jev choice answer spreading probability as given; everything else is spread evenly. */
function jevChoice(choice: string, weights: Record<string, number>) {
  const rest = (1 - Object.values(weights).reduce((a, b) => a + b, 0)) / (ids.length + 1 - Object.keys(weights).length)
  const probabilities = Object.fromEntries([...ids, "none"].map((id) => [id, weights[id] ?? rest]))
  return { template: { type: "choice", choice, probabilities, confidence: 0.9 } }
}

beforeEach(() => {
  resetProviderMocks()
  jest.spyOn(console, "warn").mockImplementation(() => undefined)
})

describe("matchTemplate with Jev", () => {
  it("gives Jev the whole catalog, read from the templates module, plus a no-match option", async () => {
    mockAskJev.mockResolvedValue(jevChoice(ids[1], { [ids[1]]: 0.9 }))
    await matchTemplate(request())

    const { state, questions } = mockAskJev.mock.calls[0][0]
    expect(state.templates.map((entry: { id: string }) => entry.id)).toEqual(ids)
    expect(Object.keys(questions.template.criteria)).toEqual([...ids, "none"])
    expect(state.templates[0]).toEqual(expect.objectContaining({ name: expect.any(String), description: expect.any(String), tags: expect.any(Array) }))
    expect(JSON.stringify(state)).not.toContain("thumbnail")
  })

  it("returns a confident match with ranked candidates", async () => {
    mockAskJev.mockResolvedValue(jevChoice(ids[1], { [ids[1]]: 0.85, [ids[2]]: 0.06 }))
    const result = await matchTemplate(request())

    expect(result).toMatchObject({ kind: "match", templateId: ids[1], decidedBy: "jev", confidence: 0.85 })
    if (result.kind !== "match") throw new Error("expected a match")
    expect(result.candidates.map((candidate) => candidate.templateId).slice(0, 2)).toEqual([ids[1], ids[2]])
    expect(result.candidates).toHaveLength(4)
    expect(mockCompleteJson).not.toHaveBeenCalled()
  })

  it("asks OpenAI for one clarifying question when the top two are close", async () => {
    mockAskJev.mockResolvedValue(jevChoice(ids[0], { [ids[0]]: 0.4, [ids[1]]: 0.35 }))
    mockCompleteJson.mockResolvedValue({ question: "Is this for a job hunt?", options: ["Yes", "No"] })

    await expect(matchTemplate(request())).resolves.toEqual({ kind: "clarify", question: "Is this for a job hunt?", options: ["Yes", "No"] })
    expect(mockCompleteJson.mock.calls[0][0].user).toContain(ids[0])
  })

  it("treats Jev's no-match answer as ambiguous", async () => {
    mockAskJev.mockResolvedValue(jevChoice("none", { none: 0.8 }))
    mockCompleteJson.mockResolvedValue({ question: "What kind of page?", options: [] })
    expect((await matchTemplate(request())).kind).toBe("clarify")
  })

  it("stops asking after the clarification limit and settles for the best candidate", async () => {
    mockAskJev.mockResolvedValue(jevChoice(ids[0], { [ids[0]]: 0.4, [ids[1]]: 0.35 }))
    const answered = [1, 2].map((n) => ({ question: `q${n}`, answer: `a${n}` }))
    const result = await matchTemplate(request({ clarifications: answered }))
    expect(result).toMatchObject({ kind: "match", templateId: ids[0] })
    expect(mockCompleteJson).not.toHaveBeenCalled()
  })

  it("settles for the best candidate when ambiguous but OpenAI is not configured", async () => {
    mockIsOpenAiConfigured.mockReturnValue(false)
    mockAskJev.mockResolvedValue(jevChoice(ids[0], { [ids[0]]: 0.4, [ids[1]]: 0.35 }))
    expect(await matchTemplate(request())).toMatchObject({ kind: "match", templateId: ids[0], confidence: 0.4 })
  })

  it("settles for the best candidate when the clarifying question fails", async () => {
    mockAskJev.mockResolvedValue(jevChoice(ids[0], { [ids[0]]: 0.4, [ids[1]]: 0.35 }))
    mockCompleteJson.mockRejectedValue(new OpenAiUnavailableError("down"))
    expect((await matchTemplate(request())).kind).toBe("match")
  })
})

describe("matchTemplate fallbacks", () => {
  it("falls back to OpenAI as the judge when Jev is unavailable", async () => {
    mockAskJev.mockRejectedValue(new JevUnavailableError("503"))
    mockCompleteJson.mockResolvedValue({ templateId: ids[3], confidence: 0.9 })
    expect(await matchTemplate(request())).toMatchObject({ kind: "match", templateId: ids[3], decidedBy: "openai" })
  })

  it("uses OpenAI directly when Jev is not configured", async () => {
    mockIsJevConfigured.mockReturnValue(false)
    mockCompleteJson.mockResolvedValue({ templateId: ids[2], confidence: 0.8 })
    await matchTemplate(request())
    expect(mockAskJev).not.toHaveBeenCalled()
    expect(JSON.parse(mockCompleteJson.mock.calls[0][0].user.split("Templates:\n")[1].split("\n")[0])).toHaveLength(ids.length)
  })

  it("reports 'unavailable' when no provider is configured or both fail", async () => {
    mockIsJevConfigured.mockReturnValue(false)
    mockIsOpenAiConfigured.mockReturnValue(false)
    expect(await matchTemplate(request())).toEqual({ kind: "unavailable" })

    mockIsJevConfigured.mockReturnValue(true)
    mockIsOpenAiConfigured.mockReturnValue(true)
    mockAskJev.mockRejectedValue(new JevUnavailableError("x"))
    mockCompleteJson.mockRejectedValue(new OpenAiUnavailableError("y"))
    expect(await matchTemplate(request())).toEqual({ kind: "unavailable" })
  })

  it("lets unexpected errors surface instead of hiding bugs", async () => {
    mockAskJev.mockRejectedValue(new TypeError("bug"))
    await expect(matchTemplate(request())).rejects.toThrow("bug")
  })
})
