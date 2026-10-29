"use client"

import { act, cleanup, renderHook } from "@testing-library/react"

import { useAppState } from "@/client/features/app-state"
import { toast } from "@/client/components/ui/use-toast"

const PAGE_STORAGE_KEY = "livepage-page-storage"
const _PROMPT_ASSIST_ENABLED_KEY = "livepage-prompt-assist-enabled"

jest.mock("@/client/components/ui/use-toast", () => {
  const t = jest.fn()
  return { toast: t, useToast: jest.fn(() => ({ toast: t })) }
})

const mockToast = toast

// Captured once so spies can delegate to the real implementation.
const originalSetItem = Storage.prototype.setItem
const setItemSpy = jest.spyOn(Storage.prototype, "setItem")

function passthroughSetItem(this: Storage, key: string, value: string) {
  return originalSetItem.call(this, key, value)
}

beforeEach(() => {
  // Ensure a fresh tab per test: unmount any leftover hooks and clear storage
  // so module-level state (baseRev, dirty, stale) never leaks between tests.
  cleanup()
  window.localStorage.clear()
  // Reset only the storage spy's implementation/calls and the toast call count.
  // Do NOT reset all mocks: that would wipe the `useToast` mock implementation.
  setItemSpy.mockReset()
  setItemSpy.mockImplementation(passthroughSetItem)
  mockToast.mockClear()
})

afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

function makeDirty() {
  const { result } = renderHook(() => useAppState())
  act(() => {
    result.current.dispatch({
      type: "SET_PAGES",
      payload: [{ tag: "page", attributes: { id: "page-1", title: "Home" }, children: [] }],
    })
  })
}

describe("useAppState persistence failure handling", () => {
  it("shows a destructive toast when setItem throws QuotaExceededError", () => {
    jest.useFakeTimers()
    setItemSpy.mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === PAGE_STORAGE_KEY) {
        const error = new Error("QuotaExceededError") as Error & { name: string }
        error.name = "QuotaExceededError"
        throw error
      }
      return passthroughSetItem.call(this, key, value)
    })

    makeDirty()

    act(() => {
      jest.advanceTimersByTime(600)
    })

    expect(mockToast).toHaveBeenCalledTimes(1)
    expect(mockToast).toHaveBeenCalledWith({
      title: "Could not save page",
      description: expect.stringContaining("storage is full"),
      variant: "destructive",
    })
  })

  it("shows a toast when setItem is stubbed to throw a generic error", () => {
    jest.useFakeTimers()
    setItemSpy.mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === PAGE_STORAGE_KEY) {
        throw new Error("storage failed")
      }
      return passthroughSetItem.call(this, key, value)
    })

    makeDirty()

    act(() => {
      jest.advanceTimersByTime(600)
    })

    expect(mockToast).toHaveBeenCalledTimes(1)
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Could not save page", variant: "destructive" }),
    )
  })

  it("does not show a toast when saves succeed", () => {
    jest.useFakeTimers()
    makeDirty()

    act(() => {
      jest.advanceTimersByTime(600)
    })

    expect(mockToast).not.toHaveBeenCalled()
  })

  it("re-notifies after a successful save clears the previous failure", () => {
    jest.useFakeTimers()
    let fail = true
    setItemSpy.mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === PAGE_STORAGE_KEY && fail) {
        const error = new Error("QuotaExceededError") as Error & { name: string }
        error.name = "QuotaExceededError"
        throw error
      }
      return passthroughSetItem.call(this, key, value)
    })

    makeDirty()
    act(() => {
      jest.advanceTimersByTime(600)
    })
    expect(mockToast).toHaveBeenCalledTimes(1)

    // A successful save clears the recorded failure so no repeat toast is shown.
    fail = false
    const { result: secondResult } = renderHook(() => useAppState())
    act(() => {
      secondResult.current.dispatch({
        type: "SET_PAGES",
        payload: [{ tag: "page", attributes: { id: "page-1", title: "Home" }, children: [] }],
      })
    })
    act(() => {
      jest.advanceTimersByTime(600)
    })
    expect(mockToast).toHaveBeenCalledTimes(1)

    // Failing again after a success re-notifies the user.
    fail = true
    const { result: thirdResult } = renderHook(() => useAppState())
    act(() => {
      thirdResult.current.dispatch({
        type: "SET_PAGES",
        payload: [{ tag: "page", attributes: { id: "page-1", title: "Home" }, children: [] }],
      })
    })
    act(() => {
      jest.advanceTimersByTime(600)
    })
    expect(mockToast).toHaveBeenCalledTimes(2)
  })
})

describe("revision-guarded persistence", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("writes a revisioned envelope and bumps baseRev on a dirty save", () => {
    const { result } = renderHook(() => useAppState())

    act(() => {
      result.current.dispatch({
        type: "SET_PAGES",
        payload: [{ tag: "page", attributes: { id: "page-1", title: "Home" }, children: [] }],
      })
    })
    act(() => {
      jest.advanceTimersByTime(600)
    })

    const stored = JSON.parse(window.localStorage.getItem(PAGE_STORAGE_KEY)!)
    expect(stored.rev).toBe(1)
    expect(stored.componentTree).toHaveLength(1)
  })

  it("loads a legacy record without rev as rev 0", () => {
    window.localStorage.setItem(
      PAGE_STORAGE_KEY,
      JSON.stringify({ componentTree: [{ tag: "page", attributes: { id: "page-1", title: "Legacy" }, children: [] }] }),
    )
    const { result } = renderHook(() => useAppState())

    // The legacy record loads as rev 0 (baseRev = 0). No write happens on hydration
    // itself (dirty is false).
    expect(result.current.state.stale).toBe(false)

    // A subsequent dirty write upgrades the legacy record to rev 1.
    act(() => {
      result.current.dispatch({
        type: "SET_PAGES",
        payload: [{ tag: "page", attributes: { id: "page-1", title: "Legacy" }, children: [] }],
      })
    })
    act(() => {
      jest.advanceTimersByTime(600)
    })

    const stored = JSON.parse(window.localStorage.getItem(PAGE_STORAGE_KEY)!)
    expect(stored.rev).toBe(1)
    expect(stored.componentTree).toHaveLength(1)
  })

  it("marks the tab stale when another tab has a newer stored revision and does not clobber it", () => {
    const { result: a } = renderHook(() => useAppState())

    act(() => {
      a.current.dispatch({
        type: "SET_PAGES",
        payload: [{ tag: "page", attributes: { id: "page-1", title: "Home" }, children: [] }],
      })
    })
    act(() => {
      jest.advanceTimersByTime(600)
    })

    // Simulate another tab writing a newer revision directly to storage.
    window.localStorage.setItem(
      PAGE_STORAGE_KEY,
      JSON.stringify({
        rev: 5,
        componentTree: [{ tag: "page", attributes: { id: "page-1", title: "Other" }, children: [] }],
      }),
    )

    // Tab A makes another edit: flush sees stored rev 5 !== baseRev 1, so it goes stale.
    act(() => {
      a.current.dispatch({
        type: "SET_PAGES",
        payload: [{ tag: "page", attributes: { id: "page-1", title: "Home2" }, children: [] }],
      })
    })
    act(() => {
      jest.advanceTimersByTime(600)
    })

    expect(a.current.state.stale).toBe(true)
    // The stored revision is not overwritten by the stale tab.
    const stored = JSON.parse(window.localStorage.getItem(PAGE_STORAGE_KEY)!)
    expect(stored.rev).toBe(5)
  })
})
