import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { AppAction } from "@/features/app-state"
import { AssistChat } from "@/features/prompt-assist"

let mockQuery = "prompt-assist=1"
jest.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(mockQuery) }))

type Handler = (body: Record<string, unknown>) => { status?: number; body: unknown }

function mockApi(handlers: Record<string, Handler>) {
  const calls: Array<{ path: string; body: Record<string, unknown> }> = []
  global.fetch = jest.fn(async (url: string, init: RequestInit) => {
    const path = String(url).replace("/api/prompt-assist/", "")
    const body = JSON.parse(String(init.body))
    calls.push({ path, body })
    const result = handlers[path](body)
    return { ok: (result.status ?? 200) < 400, status: result.status ?? 200, json: async () => result.body }
  }) as unknown as typeof fetch
  return calls
}

const originalFetch = global.fetch
const originalEnv = { ...process.env }
beforeEach(() => {
  mockQuery = "prompt-assist=1"
  process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED = "1"
})
afterEach(() => {
  global.fetch = originalFetch
  process.env = { ...originalEnv }
})

const openChat = async (dispatch = jest.fn<void, [AppAction]>()) => {
  const user = userEvent.setup()
  render(<AssistChat dispatch={dispatch} />)
  await user.click(screen.getByRole("button", { name: /open page assistant/i }))
  return { user, dispatch }
}
const send = async (user: ReturnType<typeof userEvent.setup>, text: string) => {
  await user.type(screen.getByPlaceholderText(/describe the page/i), text)
  await user.click(screen.getByRole("button", { name: "Send" }))
}

describe("AssistChat visibility", () => {
  it.each([["no query string", ""], ["another param", "tab=1"], ["the flag set to 0", "prompt-assist=0"], ["the flag set to true", "prompt-assist=true"]])(
    "renders nothing with %s",
    (_label, query) => {
      mockQuery = query
      const { container } = render(<AssistChat dispatch={jest.fn()} />)
      expect(container).toBeEmptyDOMElement()
    },
  )

  it.each([["unset", undefined], ["0", "0"], ["true", "true"]])(
    "renders nothing even with ?prompt-assist=1 when the deployment flag is %s",
    (_label, value) => {
      if (value === undefined) delete process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED
      else process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED = value
      const { container } = render(<AssistChat dispatch={jest.fn()} />)
      expect(container).toBeEmptyDOMElement()
    },
  )

  it("shows the launcher with ?prompt-assist=1, alongside other params", () => {
    mockQuery = "tab=1&prompt-assist=1"
    render(<AssistChat dispatch={jest.fn()} />)
    expect(screen.getByRole("button", { name: /open page assistant/i })).toBeInTheDocument()
  })
})

describe("AssistChat", () => {
  it("is closed by default, opens from the bubble and minimizes without losing the conversation", async () => {
    mockApi({ match: () => ({ body: { kind: "unavailable" } }) })
    const { user } = await openChat()
    await send(user, "a resume")
    await screen.findByText(/no ai provider is configured/i)

    await user.click(screen.getByRole("button", { name: /minimize page assistant/i }))
    expect(screen.queryByPlaceholderText(/describe the page/i)).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /open page assistant/i }))
    expect(screen.getByText("a resume")).toBeInTheDocument()
  })

  it("asks a clarifying question, carries the answer forward, then applies copy and design edits in one history entry", async () => {
    const calls = mockApi({
      match: (body) =>
        (body.clarifications as unknown[]).length === 0
          ? { body: { kind: "clarify", question: "Is this for a job hunt?", options: ["Yes", "No"] } }
          : { body: { kind: "match", templateId: "cv-resume-engineer-dark", confidence: 0.9, decidedBy: "jev", candidates: [] } },
      draft: () => ({ body: { values: { name: "Priya Shah", headline: "Backend engineer" }, source: "openai" } }),
      refine: (body) => {
        const shell = (body.page as { nodes: Array<{ id: string; settings: Record<string, string> }> }).nodes.find((node) => node.id === "engineer-dark-shell")
        const applied = shell?.settings.gap === "2rem"
        return {
          body: applied
            ? { satisfaction: 0.95, done: true, edits: [] }
            : { satisfaction: 0.3, done: false, edits: [{ componentId: "engineer-dark-shell", setting: "gap", value: "2rem", reason: "more air" }] },
        }
      },
    })
    const { user, dispatch } = await openChat()

    await send(user, "a site for me")
    await screen.findByText("Is this for a job hunt?")
    await user.click(screen.getByRole("button", { name: "Yes" }))

    const applyButton = await screen.findByRole("button", { name: /apply to canvas/i })
    expect(screen.getByDisplayValue("Priya Shah")).toBeInTheDocument()
    expect(screen.getByText(/1 design changes/)).toBeInTheDocument()
    expect(calls.filter((call) => call.path === "match")[1].body).toMatchObject({
      prompt: "a site for me",
      clarifications: [{ question: "Is this for a job hunt?", answer: "Yes" }],
    })
    expect(calls.filter((call) => call.path === "refine")).toHaveLength(2)

    await user.clear(screen.getByDisplayValue("Backend engineer"))
    await user.type(screen.getAllByRole("textbox").find((el) => (el as HTMLInputElement).value === "")!, "Staff engineer")
    await user.click(applyButton)

    const actions = dispatch.mock.calls.map(([action]) => action)
    const setPages = actions.find((action) => action.type === "SET_PAGES")
    const serialized = JSON.stringify(setPages)
    expect(serialized).toContain("Priya Shah")
    expect(serialized).toContain("Staff engineer")
    expect(serialized).toMatch(/"id":"engineer-dark-shell"[^}]*"gap":"2rem"/)
    expect(actions.filter((action) => action.type === "ADD_TO_HISTORY")).toHaveLength(1)
    expect(within(screen.getByRole("log")).getByRole("button", { name: /applied/i })).toBeDisabled()
  })

  it("lets the person switch template, which rebuilds the proposal around their pick", async () => {
    const calls = mockApi({
      match: () => ({ body: { kind: "match", templateId: "cv-resume-engineer-dark", confidence: 0.8, decidedBy: "jev", candidates: [] } }),
      draft: () => ({ body: { values: {}, source: "none" } }),
      refine: () => ({ body: { satisfaction: null, done: true, edits: [] } }),
    })
    const { user } = await openChat()
    await send(user, "a resume")
    await screen.findByRole("button", { name: /apply to canvas/i })

    await user.selectOptions(screen.getByLabelText("Template"), "landing-page-saas")
    await waitFor(() => expect(calls.filter((call) => call.path === "draft").at(-1)?.body.templateId).toBe("landing-page-saas"))
    expect(await screen.findByLabelText("Template")).toHaveValue("landing-page-saas")
  })

  it("with no provider configured, offers a manual template picker that leads to a proposal", async () => {
    mockApi({
      match: () => ({ body: { kind: "unavailable" } }),
      draft: () => ({ body: { values: {}, source: "none" } }),
      refine: () => ({ body: { satisfaction: null, done: true, edits: [] } }),
    })
    const { user } = await openChat()
    await send(user, "a landing page")
    const picker = await screen.findByRole("group", { name: /choose a template/i })
    await user.click(within(picker).getByRole("button", { name: /saas/i }))
    expect(await screen.findByLabelText("Template")).toHaveValue("landing-page-saas")
    expect(screen.queryByRole("group", { name: /choose a template/i })).not.toBeInTheDocument()
  })

  it("keeps the template and copy when the design loop fails partway, and says so", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined)
    mockApi({
      match: () => ({ body: { kind: "match", templateId: "cv-resume-engineer-dark", confidence: 0.9, decidedBy: "jev", candidates: [] } }),
      draft: () => ({ body: { values: { name: "Priya Shah" }, source: "openai" } }),
      refine: () => ({ status: 500, body: { error: "boom" } }),
    })
    const { user } = await openChat()
    await send(user, "a resume")
    expect(await screen.findByDisplayValue("Priya Shah")).toBeInTheDocument()
    expect(screen.getByText(/couldn.t finish tuning the design/i)).toBeInTheDocument()
    expect(screen.getByText(/no design changes/i)).toBeInTheDocument()
  })

  it("shows a friendly message on rate limiting and does not apply anything", async () => {
    mockApi({ match: () => ({ status: 429, body: { error: "slow down" } }) })
    const { user, dispatch } = await openChat()
    await send(user, "a resume")
    expect(await screen.findByText(/too quickly/i)).toBeInTheDocument()
    expect(dispatch).not.toHaveBeenCalled()
  })
})
