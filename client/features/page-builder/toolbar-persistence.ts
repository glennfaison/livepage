"use client"

const STORAGE_KEY = "livepage-toolbar"
export const STORAGE_VERSION = 1

export interface ToolbarPersistedState {
  version: number
  position: { x: number; y: number }
  layout: "horizontal" | "vertical"
}

export const DEFAULT_TOOLBAR_POSITION: Readonly<{ x: number; y: number }> = {
  x: 0,
  y: 0,
}

export const DEFAULT_TOOLBAR_LAYOUT: Readonly<"horizontal" | "vertical"> = "vertical"

function isFinitePosition(value: unknown): value is { x: number; y: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { x: unknown; y: unknown }).x === "number" &&
    Number.isFinite((value as { x: unknown; y: unknown }).x) &&
    typeof (value as { x: unknown; y: unknown }).y === "number" &&
    Number.isFinite((value as { x: unknown; y: unknown }).y)
  )
}

function isToolbarLayout(value: unknown): value is "horizontal" | "vertical" {
  return value === "horizontal" || value === "vertical"
}

function isToolbarPersistedState(value: unknown): value is ToolbarPersistedState {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { version: unknown }).version === STORAGE_VERSION &&
    isFinitePosition((value as { position: unknown }).position) &&
    isToolbarLayout((value as { layout: unknown }).layout)
  )
}

/**
 * Reads the persisted toolbar position and layout from localStorage.
 * Returns null when nothing is stored, the value is corrupted, or storage is
 * unavailable. No localStorage access happens during server render.
 */
export function readToolbarState(): ToolbarPersistedState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isToolbarPersistedState(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

/**
 * Persists the toolbar position and layout to localStorage.
 * Silently ignores storage errors (private mode, quota exceeded).
 */
export function writeToolbarState(state: ToolbarPersistedState): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage can be unavailable (private mode, quota); the toolbar then simply
    // falls back to its defaults on the next load.
  }
}
