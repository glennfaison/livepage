"use client"

import { useCallback, useSyncExternalStore } from "react"

const EMPTY_LIST: ReadonlyArray<string> = []

const listeners = new Set<() => void>()
const snapshots = new Map<string, { raw: string | null; value: ReadonlyArray<string> }>()

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function parseList(raw: string | null): ReadonlyArray<string> {
  if (!raw) return EMPTY_LIST
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return EMPTY_LIST
    return parsed.filter((item): item is string => typeof item === "string")
  } catch {
    return EMPTY_LIST
  }
}

/** Returns a referentially stable list while the stored value is unchanged, as `useSyncExternalStore` requires. */
function readList(key: string): ReadonlyArray<string> {
  const raw = readRaw(key)
  const cached = snapshots.get(key)
  if (cached?.raw === raw) return cached.value
  const value = parseList(raw)
  snapshots.set(key, { raw, value })
  return value
}

function writeList(key: string, value: ReadonlyArray<string>): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable (private mode, quota); the list then simply does not persist.
  }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

/**
 * A string list persisted in localStorage and shared across every component that reads the same key.
 * Renders an empty list on the server and during hydration, then the stored list on the client.
 */
export function useStoredList(key: string): readonly [ReadonlyArray<string>, (update: (current: ReadonlyArray<string>) => ReadonlyArray<string>) => void] {
  const list = useSyncExternalStore(
    subscribe,
    () => readList(key),
    () => EMPTY_LIST,
  )
  const updateList = useCallback(
    (update: (current: ReadonlyArray<string>) => ReadonlyArray<string>) => writeList(key, update(readList(key))),
    [key],
  )
  return [list, updateList] as const
}
