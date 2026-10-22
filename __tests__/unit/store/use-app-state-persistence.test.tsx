"use client"

import { renderHook, act } from "@testing-library/react"

import { useAppState } from "@/client/features/app-state"
import { toast } from "@/client/components/ui/use-toast"

const PAGE_STORAGE_KEY = "livepage-page-storage"

jest.mock("@/client/components/ui/use-toast", () => {
  const t = jest.fn()
  return { toast: t, useToast: jest.fn(() => ({ toast: t })) }
})

const mockToast = toast

// Installed once and kept for the life of the test file so the spy stays
// attached to Storage.prototype (jest.restoreAllMocks would detach it).
const originalSetItem = Storage.prototype.setItem
const setItemSpy = jest.spyOn(Storage.prototype, "setItem")

function passthroughSetItem(this: Storage, key: string, value: string) {
  return originalSetItem.call(this, key, value)
}

describe("useAppState persistence failure handling", () => {
  beforeEach(() => {
    window.localStorage.clear()
    jest.clearAllMocks()
    setItemSpy.mockImplementation(passthroughSetItem)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

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

    renderHook(() => useAppState())

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

    renderHook(() => useAppState())

    act(() => {
      jest.advanceTimersByTime(600)
    })

    expect(mockToast).toHaveBeenCalledTimes(1)
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Could not save page", variant: "destructive" })
    )
  })

  it("does not show a toast when saves succeed", () => {
    jest.useFakeTimers()
    renderHook(() => useAppState())

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

    const { result } = renderHook(() => useAppState())

    act(() => {
      jest.advanceTimersByTime(600)
    })
    expect(mockToast).toHaveBeenCalledTimes(1)

    // A successful save clears the recorded failure so no repeat toast is shown.
    fail = false
    act(() => {
      result.current.dispatch({ type: "SET_TOOLBAR_MINIMIZED", payload: true })
    })
    act(() => {
      jest.advanceTimersByTime(600)
    })
    expect(mockToast).toHaveBeenCalledTimes(1)

    // Failing again after a success re-notifies the user.
    fail = true
    act(() => {
      result.current.dispatch({ type: "SET_TOOLBAR_MINIMIZED", payload: false })
    })
    act(() => {
      jest.advanceTimersByTime(600)
    })
    expect(mockToast).toHaveBeenCalledTimes(2)
  })
})
