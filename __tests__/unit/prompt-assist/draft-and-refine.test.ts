/** @jest-environment node */
import { cloneTemplatePages, getPageTemplateById, listTemplateTextFields } from "@/client/features/templates"

import { mockAskJev, mockCompleteJson, mockIsJevConfigured, mockIsOpenAiConfigured, resetProviderMocks } from "../../utils/ai-provider-mocks"

jest.mock("@/server/services/jev", () => jest.requireActual("../../utils/ai-provider-mocks").jevModuleMock)
jest.mock("@/server/services/openai", () => jest.requireActual("../../utils/ai-provider-mocks").openAiModuleMock)

import { JevUnavailableError } from "@/server/services/jev"
import { OpenAiUnavailableError } from "@/server/services/openai"
import { describePage } from "@/client/features/prompt-assist"
import { draftCopy, refineDesign } from "@/server/features/prompt-assist"

const request = { prompt: "a bold dark resume", clarifications: [] }
const template = getPageTemplateById("cv-resume-engineer-dark")!
const draftTemplate = {
  name: template.metadata.name,
  description: template.metadata.description,
  fields: listTemplateTextFields(template),
}

beforeEach(() => {
  resetProviderMocks()
  jest.spyOn(console, "warn").mockImplementation(() => undefined)
})

describe("draftCopy", () => {
  it("asks for exactly the template's own text slots", async () => {
    const fields = draftTemplate.fields
    mockCompleteJson.mockResolvedValue(Object.fromEntries(fields.map((field) => [field.source, `v-${field.source}`])))
    const result = await draftCopy(request, draftTemplate)

    expect(result.source).toBe("openai")
    const { schema, user } = mockCompleteJson.mock.calls[0][0]
    expect(Object.keys(schema.shape)).toEqual(fields.map((field) => field.source))
    for (const field of fields) expect(user).toContain(field.description)
    expect(user).toContain(request.prompt)
  })

  it("leaves the template text alone without OpenAI, or when it fails", async () => {
    mockIsOpenAiConfigured.mockReturnValue(false)
    expect(await draftCopy(request, draftTemplate)).toEqual({ values: {}, source: "none" })

    mockIsOpenAiConfigured.mockReturnValue(true)
    mockCompleteJson.mockRejectedValue(new OpenAiUnavailableError("down"))
    expect(await draftCopy(request, draftTemplate)).toEqual({ values: {}, source: "none" })
  })
})

describe("refineDesign", () => {
  const pages = cloneTemplatePages(template)
  const page = describePage(pages)
  const settable = () => "engineer-dark-shell"

  it("stops when Jev says the page already satisfies the request", async () => {
    mockAskJev.mockResolvedValue({ satisfied: { type: "noul", noul: 0.93 } })
    expect(await refineDesign(request, page)).toEqual({ satisfaction: 0.93, done: true, edits: [] })
    expect(mockCompleteJson).not.toHaveBeenCalled()
  })

  it("has OpenAI propose edits when Jev is not satisfied, keeping only the valid ones", async () => {
    mockAskJev.mockResolvedValue({ satisfied: { type: "noul", noul: 0.2 } })
    mockCompleteJson.mockResolvedValue({
      satisfied: true,
      edits: [
        { componentId: settable(), setting: "gap", value: "2rem", reason: "airier" },
        { componentId: "does-not-exist", setting: "gap", value: "2rem", reason: "bad id" },
        { componentId: settable(), setting: "gap", value: "javascript:alert(1)", reason: "hostile" },
      ],
    })
    const result = await refineDesign(request, page)

    expect(result.satisfaction).toBe(0.2)
    expect(result.done).toBe(false) // Jev's verdict, not the proposer's own `satisfied`, decides
    expect(result.edits.map((edit) => [edit.componentId, edit.setting, edit.value])).toEqual([[settable(), "gap", "2rem"]])
    const prompt = mockCompleteJson.mock.calls[0][0].user
    expect(prompt).toContain(settable())
    expect(prompt).toContain("Settings available per tag")
    expect(prompt).toContain('"gap"')
  })

  it("is done when nothing valid is proposed", async () => {
    mockAskJev.mockResolvedValue({ satisfied: { type: "noul", noul: 0.2 } })
    mockCompleteJson.mockResolvedValue({ satisfied: false, edits: [] })
    expect(await refineDesign(request, page)).toMatchObject({ done: true, edits: [] })
  })

  it("without Jev, lets the proposer's verdict end the loop", async () => {
    mockIsJevConfigured.mockReturnValue(false)
    mockCompleteJson.mockResolvedValue({ satisfied: true, edits: [{ componentId: settable(), setting: "gap", value: "3rem", reason: "r" }] })
    const result = await refineDesign(request, page)
    expect(result).toMatchObject({ satisfaction: null, done: true })
    expect(result.edits).toHaveLength(1)
  })

  it("keeps working on OpenAI alone when Jev is unavailable", async () => {
    mockAskJev.mockRejectedValue(new JevUnavailableError("503"))
    mockCompleteJson.mockResolvedValue({ satisfied: false, edits: [{ componentId: settable(), setting: "gap", value: "3rem", reason: "r" }] })
    expect(await refineDesign(request, page)).toMatchObject({ satisfaction: null, done: false })
  })

  it("returns done without edits when OpenAI is missing or fails", async () => {
    mockAskJev.mockResolvedValue({ satisfied: { type: "noul", noul: 0.1 } })
    mockIsOpenAiConfigured.mockReturnValue(false)
    expect(await refineDesign(request, page)).toEqual({ satisfaction: 0.1, done: true, edits: [] })

    mockIsOpenAiConfigured.mockReturnValue(true)
    mockCompleteJson.mockRejectedValue(new OpenAiUnavailableError("down"))
    expect(await refineDesign(request, page)).toEqual({ satisfaction: 0.1, done: true, edits: [] })
  })
})
