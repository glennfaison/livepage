import { describe, expect, it, afterEach, beforeEach } from "@jest/globals"
import {
  readToolbarState,
  writeToolbarState,
  DEFAULT_TOOLBAR_POSITION,
  DEFAULT_TOOLBAR_LAYOUT,
} from "@/client/features/page-builder/toolbar-persistence"

const STORAGE_KEY = "livepage-toolbar"

function clearStorage(): void {
  window.localStorage.removeItem(STORAGE_KEY)
}

function makeStorageUnavailable(): () => void {
  const original = Object.getOwnPropertyDescriptor(window, "localStorage")
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get: () => {
      throw new Error("storage unavailable")
    },
  })
  return () => {
    if (original) Object.defineProperty(window, "localStorage", original)
    else delete (window as unknown as { localStorage?: Storage }).localStorage
  }
}

describe("toolbar persistence", () => {
  beforeEach(() => {
    clearStorage()
  })

  afterEach(() => {
    clearStorage()
  })

  it("returns null when nothing is stored", () => {
    expect(readToolbarState()).toBeNull()
  })

  it("round-trips a valid state", () => {
    const state = {
      version: 1,
      position: { x: 123, y: 456 },
      layout: "horizontal",
    } as const
    writeToolbarState(state)
    expect(readToolbarState()).toEqual(state)
  })

  it("returns null for corrupted JSON", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json")
    expect(readToolbarState()).toBeNull()
  })

  it("returns null for a wrong storage version", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 99, position: { x: 1, y: 2 }, layout: "vertical" }),
    )
    expect(readToolbarState()).toBeNull()
  })

  it("returns null for a missing position", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, layout: "vertical" }),
    )
    expect(readToolbarState()).toBeNull()
  })

  it("returns null for an invalid layout", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, position: { x: 1, y: 2 }, layout: "diagonal" }),
    )
    expect(readToolbarState()).toBeNull()
  })

  it("returns null and does not throw when storage is unavailable on read", () => {
    const restore = makeStorageUnavailable()
    try {
      expect(readToolbarState()).toBeNull()
    } finally {
      restore()
    }
  })

  it("does not throw when storage is unavailable on write", () => {
    const restore = makeStorageUnavailable()
    try {
      expect(() =>
        writeToolbarState({
          version: 1,
          position: { x: 1, y: 2 },
          layout: "vertical",
        }),
      ).not.toThrow()
    } finally {
      restore()
    }
  })

  it("exposes the current defaults", () => {
    expect(DEFAULT_TOOLBAR_POSITION).toEqual({ x: 0, y: 0 })
    expect(DEFAULT_TOOLBAR_LAYOUT).toBe("vertical")
  })
})
