import { act, renderHook, waitFor } from "@testing-library/react"

import { useAppState } from "@/client/features/app-state"
import type { AppState } from "@/client/features/app-state"

const PAGE_STORAGE_KEY = "livepage-page-storage"
const PAGE_UI_STATE_KEY = "livepage-page-ui-state"
const PROMPT_ASSIST_ENABLED_KEY = "livepage-prompt-assist-enabled"

type StoredPageOverrides = Partial<{
  rev: number
  componentTree: AppState["componentTree"]
  activePage: string
  pageBuilderMode: AppState["pageBuilderMode"]
  toolbarMinimized: boolean
}>

function seedStoredPage(overrides: StoredPageOverrides = {}) {
  const stored = {
    rev: 0,
    componentTree: [{ tag: "page", attributes: { id: "page-9", title: "Restored" }, children: [] }],
    ...overrides,
  }
  window.localStorage.setItem(PAGE_STORAGE_KEY, JSON.stringify(stored))

  const ui = {
    activePage: overrides.activePage ?? "page-9",
    pageBuilderMode: overrides.pageBuilderMode ?? "preview",
    toolbarMinimized: overrides.toolbarMinimized ?? true,
  }
  window.localStorage.setItem(PAGE_UI_STATE_KEY, JSON.stringify(ui))
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

describe("useAppState shared store", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("gives every caller the same shared state and dispatch", () => {
    const first = renderHook(() => useAppState())
    const second = renderHook(() => useAppState())

    expect(first.result.current.state).toBe(second.result.current.state)
    expect(first.result.current.dispatch).toBe(second.result.current.dispatch)

    act(() => {
      first.result.current.dispatch({ type: "SET_TOOLBAR_MINIMIZED", payload: true })
    })

    expect(second.result.current.state.toolbarMinimized).toBe(true)
  })

  it("is a single writer so a second instance cannot clobber the first", async () => {
    const originalSetItem = Storage.prototype.setItem
    const setItemSpy = jest.spyOn(Storage.prototype, "setItem")
    const writes: string[] = []
    setItemSpy.mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === PAGE_STORAGE_KEY) writes.push(value)
      return originalSetItem.call(this, key, value)
    })

    const first = renderHook(() => useAppState())
    const second = renderHook(() => useAppState())

    // Both instances share one debounced save; dispatching a document change
    // from either instance writes the same shared state once, so no stale
    // second instance can clobber the first instance's write.
    act(() => {
      first.result.current.dispatch({
        type: "SET_PAGES",
        payload: [{ tag: "page", attributes: { id: "page-1", title: "Home" }, children: [] }],
      })
    })

    await waitFor(() => expect(writes).toHaveLength(1), { timeout: 2000 })

    const saved = JSON.parse(writes[0])
    expect(saved.rev).toBe(1)
    expect(saved.componentTree).toHaveLength(1)
    // The second instance shares the same store, so it reflects the dispatch too.
    expect(second.result.current.state.componentTree).toHaveLength(1)

    setItemSpy.mockRestore()
  })
})
