import {
  LIVE_PAGE_AI_MAX_TRANSCRIPT_MESSAGES,
  livePageAIRequestSchema,
  livePageAIResponseSchema,
} from "@/features/livepage-ai/contracts"
import {
  MissingTypesafeApiKeyError,
  planLivePageAI,
} from "@/features/livepage-ai/service"
import { sendLivePageAiMessage } from "@/features/livepage-ai/transport"

describe("LivePageAI contracts and service", () => {
  const fetchMock = jest.fn()
  const response = (body: unknown, ok = true) => ({ ok, json: async () => body }) as Response

  beforeEach(() => {
    fetchMock.mockReset()
    global.fetch = fetchMock
    process.env.TYPESAFE_API_KEY = "test-key"
  })

  afterAll(() => {
    delete process.env.TYPESAFE_API_KEY
    fetchMock.mockRestore()
  })

  it("rejects malformed requests and arbitrary node tags", () => {
    expect(() => livePageAIRequestSchema.parse({ prompt: "" })).toThrow()
    expect(() =>
      livePageAIRequestSchema.parse({
        prompt: "Build a page",
        currentPage: [{ tag: "script", attributes: {}, children: [] }],
      }),
    ).toThrow()
  })

  it("accepts only a bounded user/assistant transcript", () => {
    const transcript = [
      { role: "user" as const, content: "Earlier request" },
      { role: "assistant" as const, content: "Earlier response" },
    ]
    expect(livePageAIRequestSchema.parse({
      sessionId: "00000000-0000-4000-8000-000000000001",
      prompt: "Continue",
      transcript,
      historyIndex: 0,
    }).transcript).toEqual(transcript)
    expect(() => livePageAIRequestSchema.parse({
      sessionId: "00000000-0000-4000-8000-000000000001",
      prompt: "Continue",
      transcript: [{ role: "system", content: "not allowed" }],
      historyIndex: 0,
    })).toThrow()
    expect(() => livePageAIRequestSchema.parse({
      sessionId: "00000000-0000-4000-8000-000000000001",
      prompt: "Continue",
      transcript: Array.from({ length: 21 }, () => ({ role: "user" as const, content: "message" })),
      historyIndex: 0,
    })).toThrow()
  })

  it("requires a concrete mutation target and terminal progress signal", () => {
    expect(() => livePageAIResponseSchema.parse({
      status: "completed",
      message: "Done",
      actions: [],
      progress: [{
        type: "proposed_mutation",
        intent: "Add copy",
        componentTag: "paragraph",
        componentLabel: "Paragraph",
        targetLocation: "main column",
        status: "completed",
        signal: "completed",
      }],
    })).toThrow()

    const response = livePageAIResponseSchema.parse({
      status: "completed",
      message: "Done",
      actions: [],
      progress: [{
        type: "proposed_mutation",
        intent: "Add copy",
        componentTag: "paragraph",
        componentLabel: "Paragraph",
        targetLocation: "main column",
        parentId: "column-1",
        content: "Welcome",
        status: "completed",
        signal: "completed",
      }],
    })
    expect(response.progress[0]).toMatchObject({
      componentTag: "paragraph",
      parentId: "column-1",
      content: "Welcome",
      signal: "completed",
    })
  })

  it("bounds the client transcript sent with each request", async () => {
    fetchMock.mockResolvedValueOnce(response({
      status: "completed",
      message: "Done",
      actions: [],
    }))
    const transcript = Array.from({ length: LIVE_PAGE_AI_MAX_TRANSCRIPT_MESSAGES + 3 }, (_, index) => ({
      role: "user" as const,
      content: `Message ${index}`,
    }))

    await sendLivePageAiMessage({
      sessionId: "00000000-0000-4000-8000-000000000001",
      message: "Latest request",
      componentTree: [],
      historyIndex: 0,
      transcript,
    })

    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.transcript).toHaveLength(LIVE_PAGE_AI_MAX_TRANSCRIPT_MESSAGES)
    expect(body.transcript[0].content).toBe("Message 3")
    expect(body.transcript.at(-1).content).toBe("Message 22")
  })

  it("fails explicitly when the server key is absent", async () => {
    delete process.env.TYPESAFE_API_KEY
    await expect(planLivePageAI({ sessionId: "00000000-0000-4000-8000-000000000001", prompt: "Build a landing page", transcript: [], historyIndex: 0 })).rejects.toBeInstanceOf(
      MissingTypesafeApiKeyError,
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("returns a safe out-of-scope result", async () => {
    fetchMock.mockResolvedValueOnce(
      response({ answers: { is_page_building: { type: "noul", noul: 0.05 } } }),
    )
    const result = await planLivePageAI({ sessionId: "00000000-0000-4000-8000-000000000001", prompt: "Tell me a joke", transcript: [], historyIndex: 0 })
    expect(result.status).toBe("out_of_scope")
    expect(result.actions).toEqual([])
    expect(livePageAIResponseSchema.parse(result)).toEqual(result)
  })

  it("returns a bounded clarification signal for an ambiguous action", async () => {
    fetchMock
      .mockResolvedValueOnce(response({ answers: { is_page_building: { type: "noul", noul: 0.99 } } }))
      .mockResolvedValueOnce(response({ answers: { action: { type: "choice", choice: "clarify" } } }))

    const result = await planLivePageAI({
      sessionId: "00000000-0000-4000-8000-000000000001",
      prompt: "Make it better",
      transcript: [],
      historyIndex: 0,
    })

    expect(result.status).toBe("needs_clarification")
    expect(result.progress.at(-1)).toMatchObject({
      type: "proposed_mutation",
      signal: "needs_clarification",
      status: "needs_clarification",
    })
    expect(livePageAIResponseSchema.parse(result)).toEqual(result)
  })

  it("maps only closed-set Jev decisions to safe actions", async () => {
    const transcript = [{ role: "user" as const, content: "Use a dark style" }]
    fetchMock
      .mockResolvedValueOnce(
        response({ answers: { is_page_building: { type: "noul", noul: 0.99 } } }),
      )
      .mockResolvedValueOnce(
        response({ answers: { action: { type: "choice", choice: "create_page" } } }),
      )
    const result = await planLivePageAI({
      sessionId: "00000000-0000-4000-8000-000000000001",
      prompt: "Create a portfolio page",
      transcript,
      historyIndex: 0,
    })
    expect(result.actions).toEqual([
      { type: "create_page", title: "New Page", reason: "The request asks for a new page." },
    ])
    expect(result.progress).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: "proposed_mutation",
        componentTag: "page",
        targetLocation: "page root",
      }),
    ]))
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).state.transcript).toEqual(transcript)
  })

  it("builds a bounded resume section plan when Jev lacks a concrete next action", async () => {
    fetchMock
      .mockResolvedValueOnce(response({ answers: { is_page_building: { type: "noul", noul: 0.99 } } }))
      .mockResolvedValueOnce(response({ answers: { next_action: { type: "choice", choice: "clarify" } } }))

    const result = await planLivePageAI({
      sessionId: "00000000-0000-4000-8000-000000000001",
      prompt: "Build a resume for a software engineer with skills and projects",
      currentPage: [{ tag: "page", attributes: { id: "page-1", title: "Home Page" }, children: [] }],
      transcript: [],
      historyIndex: 0,
    })

    expect(result.status).toBe("completed")
    expect(result.actions.map((action) => action.type)).toEqual([
      "add_component",
      "add_component",
      "add_component",
      "add_component",
      "add_component",
      "add_component",
      "add_component",
    ])
    expect(result.progress.some((event) => event.componentTag === "header1" && event.targetLocation === "page root")).toBe(true)
  })

  it("plans a broad resume request as concrete multi-step work with terminal progress", async () => {
    fetchMock
      .mockResolvedValueOnce(response({ answers: { is_page_building: { type: "noul", noul: 0.99 } } }))
      .mockResolvedValueOnce(response({ answers: {
        next_action: { type: "choice", choice: "add_component" },
        component_tag: { type: "choice", choice: "header1" },
        target: { type: "choice", choice: "page-1" },
        content: { type: "choice", choice: "Alex Morgan — Software Engineer" },
      } }))
      .mockResolvedValueOnce(response({ answers: {
        next_action: { type: "choice", choice: "add_component" },
        component_tag: { type: "choice", choice: "paragraph" },
        target: { type: "choice", choice: "page-1" },
        content: { type: "choice", choice: "Building reliable products with TypeScript and React." },
      } }))
      .mockResolvedValueOnce(response({ answers: {
        next_action: { type: "choice", choice: "add_component" },
        component_tag: { type: "choice", choice: "link" },
        target: { type: "choice", choice: "page-1" },
        content: { type: "choice", choice: "View my GitHub" },
      } }))
      .mockResolvedValueOnce(response({ answers: { next_action: { type: "choice", choice: "complete" } } }))

    const result = await planLivePageAI({
      sessionId: "00000000-0000-4000-8000-000000000001",
      prompt: "Build a polished software engineer resume page with a clear introduction, summary, and GitHub link.",
      currentPage: initialPage,
      transcript: [],
      historyIndex: 0,
    })

    expect(result.status).toBe("completed")
    expect(result.actions).toEqual([
      expect.objectContaining({ type: "add_component", tag: "header1", parentId: "page-1", content: "Alex Morgan — Software Engineer" }),
      expect.objectContaining({ type: "add_component", tag: "paragraph", parentId: "page-1", content: "Building reliable products with TypeScript and React." }),
      expect.objectContaining({ type: "add_component", tag: "link", parentId: "page-1", content: "View my GitHub" }),
    ])
    expect(result.progress).toHaveLength(4)
    expect(result.progress.map((event) => event.type)).toEqual([
      "scope_evaluation",
      "proposed_mutation",
      "proposed_mutation",
      "proposed_mutation",
    ])
    expect(result.progress.slice(1).every((event) => event.targetLocation === "component page-1")).toBe(true)
    expect(result.progress.at(-1)).toMatchObject({ status: "completed", signal: "completed", content: "View my GitHub" })
    expect(livePageAIResponseSchema.parse(result)).toEqual(result)
    expect(fetchMock).toHaveBeenCalledTimes(5)
  })

  describe("resumable workflow", () => {
    it("asks a clarifying question when the request topic isn't recognized", async () => {
      fetchMock.mockResolvedValueOnce(response({ answers: { is_page_building: { type: "noul", noul: 0.9 } } }))

      const result = await planLivePageAI({
        sessionId: "00000000-0000-4000-8000-000000000001",
        prompt: "Build something great for me",
        currentPage: initialPage,
        transcript: [],
        historyIndex: 0,
        workflow: { phase: "start", confirmed: false, completedActionCount: 0 },
      })

      expect(result.status).toBe("needs_clarification")
      expect(result.workflow?.phase).toBe("clarifying")
      expect(result.workflow?.question).toBeTruthy()
      expect(livePageAIResponseSchema.parse(result)).toEqual(result)
    })

    it("shares a plan and requires confirmation before mutating the page", async () => {
      fetchMock.mockResolvedValueOnce(response({ answers: { is_page_building: { type: "noul", noul: 0.9 } } }))

      const result = await planLivePageAI({
        sessionId: "00000000-0000-4000-8000-000000000001",
        prompt: "Build a portfolio site for a photographer",
        currentPage: initialPage,
        transcript: [],
        historyIndex: 0,
        workflow: { phase: "start", confirmed: false, completedActionCount: 0 },
      })

      expect(result.status).toBe("needs_clarification")
      expect(result.workflow?.phase).toBe("confirmation")
      expect(result.workflow?.requiresConfirmation).toBe(true)
      expect(result.workflow?.plan?.length).toBeGreaterThan(0)
      expect(result.actions).toEqual([])
    })

    it("requires confirmation before workflow mutation phases", async () => {
      fetchMock.mockResolvedValueOnce(response({ answers: { is_page_building: { type: "noul", noul: 0.9 } } }))

      const result = await planLivePageAI({
        sessionId: "00000000-0000-4000-8000-000000000001",
        prompt: "Build a portfolio site for a photographer",
        currentPage: initialPage,
        transcript: [],
        historyIndex: 0,
        workflow: { phase: "next", confirmed: false, completedActionCount: 0 },
      })

      expect(result.status).toBe("needs_clarification")
      expect(result.workflow?.phase).toBe("confirmation")
      expect(result.actions).toEqual([])
    })

    it("decides to add the next missing component and reports evaluation progress", async () => {
      fetchMock.mockResolvedValueOnce(response({ answers: { is_page_building: { type: "noul", noul: 0.9 } } }))

      const result = await planLivePageAI({
        sessionId: "00000000-0000-4000-8000-000000000001",
        prompt: "Build a portfolio site for a photographer",
        currentPage: initialPage,
        transcript: [],
        historyIndex: 0,
        workflow: { phase: "next", confirmed: true, completedActionCount: 0 },
      })

      expect(result.workflow?.phase).toBe("mutation")
      expect(result.actions).toHaveLength(1)
      expect(result.actions[0]).toMatchObject({ type: "add_component", tag: "header1" })
      expect(result.workflow?.evaluation?.meetsRequirements).toBe(false)
      expect(result.workflow?.currentStep).toBeTruthy()
    })

    it("decides to update an empty planned component instead of adding a duplicate", async () => {
      fetchMock.mockResolvedValueOnce(response({ answers: { is_page_building: { type: "noul", noul: 0.9 } } }))

      const pageWithEmptyHeader = [{
        tag: "page",
        attributes: { id: "page-1", title: "Resume" },
        children: [
          { tag: "header1", attributes: { id: "header-1" }, children: [] },
          { tag: "paragraph", attributes: { id: "paragraph-1" }, children: [] },
          { tag: "header2", attributes: { id: "header2-1" }, children: [] },
          { tag: "paragraph", attributes: { id: "paragraph-2" }, children: [] },
          { tag: "header2", attributes: { id: "header2-2" }, children: [] },
          { tag: "paragraph", attributes: { id: "paragraph-3" }, children: [] },
          { tag: "header2", attributes: { id: "header2-3" }, children: [] },
        ],
      }]

      const result = await planLivePageAI({
        sessionId: "00000000-0000-4000-8000-000000000001",
        prompt: "Build a resume for a software engineer",
        currentPage: pageWithEmptyHeader,
        transcript: [],
        historyIndex: 0,
        workflow: { phase: "next", confirmed: true, completedActionCount: 7 },
      })

      expect(result.actions).toHaveLength(1)
      expect(result.actions[0]).toMatchObject({ type: "update_component", componentId: "header-1", field: "text" })
    })

    it("decides to remove an exact duplicate component", async () => {
      fetchMock.mockResolvedValueOnce(response({ answers: { is_page_building: { type: "noul", noul: 0.9 } } }))

      const pageWithDuplicate = [{
        tag: "page",
        attributes: { id: "page-1", title: "Resume" },
        children: [
          { tag: "header1", attributes: { id: "header-1" }, children: ["Software Engineer Resume"] },
          { tag: "header1", attributes: { id: "header-1-dup" }, children: ["Software Engineer Resume"] },
        ],
      }]

      const result = await planLivePageAI({
        sessionId: "00000000-0000-4000-8000-000000000001",
        prompt: "Build a resume for a software engineer",
        currentPage: pageWithDuplicate,
        transcript: [],
        historyIndex: 0,
        workflow: { phase: "next", confirmed: true, completedActionCount: 1, createdComponentIds: ["header-1-dup"] },
      })

      expect(result.actions).toEqual([
        expect.objectContaining({ type: "remove_component", componentId: "header-1-dup" }),
      ])
    })

    it("reports completion once every planned component is present and filled in", async () => {
      fetchMock.mockResolvedValueOnce(response({ answers: { is_page_building: { type: "noul", noul: 0.9 } } }))

      const completePage = [{
        tag: "page",
        attributes: { id: "page-1", title: "Welcome" },
        children: [
          { tag: "header1", attributes: { id: "id-1" }, children: ["Welcome"] },
          { tag: "paragraph", attributes: { id: "id-2" }, children: ["I'm a designer and developer who loves building thoughtful, functional experiences. Take a look at my work below, and feel free to reach out if you'd like to collaborate."] },
          { tag: "header2", attributes: { id: "id-3" }, children: ["Featured Work"] },
          { tag: "paragraph", attributes: { id: "id-4" }, children: ["A selection of recent projects spanning product design, front-end development, and brand identity — each crafted with an eye for detail and a focus on real user needs."] },
          { tag: "header2", attributes: { id: "id-5" }, children: ["About"] },
          { tag: "paragraph", attributes: { id: "id-6" }, children: ["I bring a blend of creative and technical skills to every project, with a passion for solving problems and building products people genuinely enjoy using."] },
          { tag: "button", attributes: { id: "id-7" }, children: ["Get in touch"] },
        ],
      }]

      const result = await planLivePageAI({
        sessionId: "00000000-0000-4000-8000-000000000001",
        prompt: "Build a portfolio site for a photographer",
        currentPage: completePage,
        transcript: [],
        historyIndex: 0,
        workflow: { phase: "next", confirmed: true, completedActionCount: 7 },
      })

      expect(result.status).toBe("completed")
      expect(result.workflow?.phase).toBe("complete")
      expect(result.workflow?.evaluation?.meetsRequirements).toBe(true)
      expect(result.actions).toEqual([])
    })

    it("repairs a component that verification found missing before continuing", async () => {
      fetchMock.mockResolvedValueOnce(response({ answers: { is_page_building: { type: "noul", noul: 0.9 } } }))

      const result = await planLivePageAI({
        sessionId: "00000000-0000-4000-8000-000000000001",
        prompt: "Build a portfolio site for a photographer",
        currentPage: initialPage,
        transcript: [],
        historyIndex: 0,
        workflow: {
          phase: "verify",
          confirmed: true,
          completedActionCount: 1,
          observation: { componentId: "header-1", exists: false, rendered: false, validGeometry: false },
        },
      })

      expect(result.actions).toEqual([
        expect.objectContaining({ type: "update_component", componentId: "header-1", field: "text" }),
      ])
      expect(result.workflow?.currentStep).toBeTruthy()
    })

    it("only attempts one geometry repair per component before moving on", async () => {
      fetchMock.mockResolvedValueOnce(response({ answers: { is_page_building: { type: "noul", noul: 0.9 } } }))

      const result = await planLivePageAI({
        sessionId: "00000000-0000-4000-8000-000000000001",
        prompt: "Build a portfolio site for a photographer",
        currentPage: [{
          tag: "page",
          attributes: { id: "page-1", title: "Welcome" },
          children: [{ tag: "header1", attributes: { id: "header-1" }, children: ["Welcome"] }],
        }],
        transcript: [],
        historyIndex: 0,
        workflow: {
          phase: "verify",
          confirmed: true,
          completedActionCount: 1,
          lastAction: { type: "update_component", componentId: "header-1", field: "custom-classes" },
          observation: { componentId: "header-1", exists: true, rendered: true, validGeometry: false },
        },
      })

      // Since a geometry repair for header-1 was already attempted, LivePageAI
      // should move on to the next planned component instead of repeating it.
      expect(result.actions[0]).not.toMatchObject({ componentId: "header-1", field: "custom-classes" })
      expect(result.actions[0]).toMatchObject({ type: "add_component", tag: "paragraph" })
    })
  })
})

const initialPage = [{ tag: "page", attributes: { id: "page-1", title: "Resume" }, children: [] }]
