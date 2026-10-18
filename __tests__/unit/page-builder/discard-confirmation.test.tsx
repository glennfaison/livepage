import { act, renderHook } from "@testing-library/react"
import { useDiscardConfirmation } from "@/client/features/page-builder/hooks"
import type { AppAction, AppState, AppNode, HistoryEntry } from "@/client/features/types"

const DISCARD = "DISCARD_CHANGES"

function historyEntry(id: string): HistoryEntry {
  return {
    id,
    action: `Action ${id}`,
    timestamp: new Date(0),
    pageState: [] as ReadonlyArray<AppNode>,
  }
}

function stateWithHistory(entries: ReadonlyArray<HistoryEntry>): AppState {
  return {
    history: entries,
    currentHistoryIndex: entries.length - 1,
    historyPreviewIndex: null,
    originalHistoryState: null,
  } as AppState
}

describe("useDiscardConfirmation", () => {
  let dispatch: jest.Mock

  beforeEach(() => {
    window.localStorage.clear()
    dispatch = jest.fn()
  })

  it("always asks for confirmation when there are changes to discard", () => {
    const state = stateWithHistory([historyEntry("1"), historyEntry("2")])
    const { result } = renderHook(() => useDiscardConfirmation(dispatch, state))

    expect(result.current.showConfirmation).toBe(false)

    act(() => {
      result.current.handleDiscardWithConfirmation()
    })

    expect(result.current.showConfirmation).toBe(true)
    expect(dispatch).not.toHaveBeenCalled()
  })

  it("discards the changes once the dialog is confirmed", () => {
    dispatch = jest.fn()
    const state = stateWithHistory([historyEntry("1"), historyEntry("2")])
    const { result } = renderHook(() => useDiscardConfirmation(dispatch, state))

    act(() => {
      result.current.handleDiscardWithConfirmation()
    })
    act(() => {
      result.current.handleConfirm()
    })

    expect(dispatch).toHaveBeenCalledWith({ type: DISCARD } as AppAction)
    expect(result.current.showConfirmation).toBe(false)
  })

  it("keeps the page when the confirmation dialog is cancelled", () => {
    dispatch = jest.fn()
    const state = stateWithHistory([historyEntry("1"), historyEntry("2")])
    const { result } = renderHook(() => useDiscardConfirmation(dispatch, state))

    act(() => {
      result.current.handleDiscardWithConfirmation()
    })
    act(() => {
      result.current.handleCancel()
    })

    expect(dispatch).not.toHaveBeenCalled()
    expect(result.current.showConfirmation).toBe(false)
  })

  it("discards immediately and toasts when there is nothing to discard", () => {
    dispatch = jest.fn()
    const state = stateWithHistory([historyEntry("1")])
    const { result } = renderHook(() => useDiscardConfirmation(dispatch, state))

    act(() => {
      result.current.handleDiscardWithConfirmation()
    })

    expect(dispatch).toHaveBeenCalledWith({ type: DISCARD } as AppAction)
    expect(result.current.showConfirmation).toBe(false)
  })

  it("discards without asking again once the user opts out", () => {
    dispatch = jest.fn()
    window.localStorage.setItem("livepage-discard-confirmation", "false")
    const state = stateWithHistory([historyEntry("1"), historyEntry("2")])
    const { result } = renderHook(() => useDiscardConfirmation(dispatch, state))

    act(() => {
      result.current.handleDiscardWithConfirmation()
    })

    expect(dispatch).toHaveBeenCalledWith({ type: DISCARD } as AppAction)
    expect(result.current.showConfirmation).toBe(false)
  })

  it("persists the opt-out and asks again when it is turned back on", () => {
    dispatch = jest.fn()
    const state = stateWithHistory([historyEntry("1"), historyEntry("2")])
    const { result } = renderHook(() => useDiscardConfirmation(dispatch, state))

    act(() => {
      result.current.handleAskBeforeDiscardChange(false)
    })
    expect(window.localStorage.getItem("livepage-discard-confirmation")).toBe("false")

    act(() => {
      result.current.handleDiscardWithConfirmation()
    })
    expect(dispatch).toHaveBeenCalledWith({ type: DISCARD } as AppAction)

    act(() => {
      result.current.handleAskBeforeDiscardChange(true)
    })
    expect(window.localStorage.getItem("livepage-discard-confirmation")).toBe("true")

    act(() => {
      result.current.handleDiscardWithConfirmation()
    })
    expect(dispatch).not.toHaveBeenCalledTimes(2)
    expect(result.current.showConfirmation).toBe(true)
  })
})
