import { renderHook } from "@testing-library/react"

import { useAppState } from "@/client/features/app-state"
import type { AppState } from "@/client/features/app-state"

const PAGE_STORAGE_KEY = "livepage-page-storage"
const PAGE_STORAGE_VERSION = 1
const PROMPT_ASSIST_ENABLED_KEY = "livepage-prompt-assist-enabled"

type StoredPageOverrides = Partial<{
  version: number
  componentTree: AppState["componentTree"]
  activePage: string
  pageBuilderMode: AppState["pageBuilderMode"]
  toolbarMinimized: boolean
}>

function seedStoredPage(overrides: StoredPageOverrides = {}) {
  const stored = {
    version: PAGE_STORAGE_VERSION,
    componentTree: [{ tag: "page", attributes: { id: "page-9", title: "Restored" }, children: [] }],
    activePage: "page-9",
    pageBuilderMode: "preview",
    toolbarMinimized: true,
    ...overrides,
  }
  window.localStorage.setItem(PAGE_STORAGE_KEY, JSON.stringify(stored))
}

describe("useAppState", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("renders browser-free defaults on the first render even when a session is stored", () => {
    seedStoredPage()
    window.localStorage.setItem(PROMPT_ASSIST_ENABLED_KEY, "true")

    const renderedStates: AppState[] = []
    renderHook(() => {
      const { state } = useAppState()
      renderedStates.push(state)
      return state
    })

    // The first client render must match the server-rendered HTML, so it cannot
    // depend on localStorage; reading it there is what broke hydration.
    const firstRender = renderedStates[0]
    expect(firstRender.toolbarMinimized).toBe(false)
    expect(firstRender.promptAssistEnabled).toBe(false)
    expect(firstRender.pageBuilderMode).toBe("edit")
    expect(firstRender.componentTree).toHaveLength(1)
    expect(firstRender.history).toHaveLength(0)
  })

  it("adopts the stored session after mount and seeds history from the adopted tree", () => {
    seedStoredPage()
    window.localStorage.setItem(PROMPT_ASSIST_ENABLED_KEY, "true")

    const { result } = renderHook(() => useAppState().state)

    const state = result.current
    expect(state.toolbarMinimized).toBe(true)
    expect(state.promptAssistEnabled).toBe(true)
    expect(state.pageBuilderMode).toBe("preview")
    expect(state.activePage).toBe("page-9")
    expect(state.componentTree[0].attributes.id).toBe("page-9")
    expect(state.history).toHaveLength(1)
    expect(state.history[0].action).toBe("Page created")
    expect(state.history[0].pageState).toHaveLength(1)
    expect(state.currentHistoryIndex).toBe(0)
  })

  it("seeds the default page into history when nothing is stored", () => {
    const { result } = renderHook(() => useAppState().state)

    expect(result.current.componentTree[0].attributes.id).toBe("page-1")
    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].action).toBe("Page created")
    expect(result.current.history[0].pageState).toHaveLength(1)
    expect(result.current.currentHistoryIndex).toBe(0)
  })
})
