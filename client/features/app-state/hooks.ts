"use client"

import { useEffect, useSyncExternalStore } from "react"
import { useToast, toast } from "@/client/components/ui/use-toast"
import { appReducer, initialState } from "@/client/features/app-state/commands/reducer"
import type { AppState, AppAction, PersistedSession } from "@/client/features/types"

const PAGE_STORAGE_KEY = "livepage-page-storage"
const PAGE_STORAGE_VERSION = 1
const PROMPT_ASSIST_ENABLED_KEY = "livepage-prompt-assist-enabled"

interface PersistedPageState {
  version: number
  componentTree: AppState["componentTree"]
  activePage: string
  pageBuilderMode: AppState["pageBuilderMode"]
  toolbarMinimized: boolean
}

type PersistResult = { ok: true } | { ok: false; error: Error }

/**
 * One shared app store per tab.
 *
 * Every `useAppState()` caller reads the same module-level `currentState` and
 * dispatches through the same module-level `dispatch`, so there is exactly one
 * reducer, one debounced save, and one `localStorage` writer per tab. This
 * prevents a second `useAppState()` instance (for example inside
 * `SettingsPopover`) from hydrating a stale snapshot and clobbering the first
 * instance's in-flight write to `livepage-page-storage`.
 *
 * The store is scoped to its subscribers: the first subscriber starts from a
 * fresh initial state and the last subscriber leaving resets it. This keeps
 * module-level state from leaking between tests (each renderHook is its own
 * tab) while preserving one live store per tab in production.
 */
let currentState: AppState = initialState
const listeners = new Set<() => void>()
let saveTimeoutRef: ReturnType<typeof setTimeout> | null = null
let setToastRef: ((props: Parameters<typeof toast>[0]) => void) | null = null
let hydrated = false
let listenerCount = 0

function resetStore() {
  currentState = initialState
  hydrated = false
  if (saveTimeoutRef) {
    clearTimeout(saveTimeoutRef)
    saveTimeoutRef = null
  }
}

function notify() {
  for (const fn of listeners) fn()
}

function subscribe(callback: () => void) {
  if (listenerCount === 0) {
    resetStore()
  }
  listenerCount += 1
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
    listenerCount -= 1
    if (listenerCount === 0) {
      resetStore()
    }
  }
}

function getSnapshot(): AppState {
  return currentState
}

function getServerSnapshot(): AppState {
  return initialState
}

function loadPersistedState(): PersistedPageState | null {
  if (typeof window === "undefined") return null
  try {
    const stored = window.localStorage.getItem(PAGE_STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as PersistedPageState
    if (parsed.version !== PAGE_STORAGE_VERSION) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function savePersistedState(state: AppState): PersistResult {
  if (typeof window === "undefined") return { ok: true }
  try {
    const toPersist: PersistedPageState = {
      version: PAGE_STORAGE_VERSION,
      componentTree: state.componentTree,
      activePage: state.activePage,
      pageBuilderMode: state.pageBuilderMode,
      toolbarMinimized: state.toolbarMinimized,
    }
    window.localStorage.setItem(PAGE_STORAGE_KEY, JSON.stringify(toPersist))
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

function scheduleSave(state: AppState) {
  if (saveTimeoutRef) {
    clearTimeout(saveTimeoutRef)
  }
  saveTimeoutRef = setTimeout(() => {
    saveTimeoutRef = null
    const result = savePersistedState(state)
    if (result.ok) return
    const error = result.error
    if (setToastRef) {
      setToastRef({
        title: "Could not save page",
        description:
          error.name === "QuotaExceededError"
            ? "Browser storage is full. Free up space or reduce the page size to keep saving."
            : "Page state could not be saved to browser storage.",
        variant: "destructive",
      })
    }
  }, 500)
}

function dispatch(action: AppAction) {
  currentState = appReducer(currentState, action)
  if (action.type === "SET_PROMPT_ASSIST_ENABLED" && typeof window !== "undefined") {
    window.localStorage.setItem(PROMPT_ASSIST_ENABLED_KEY, String(action.payload))
  }
  notify()
  scheduleSave(currentState)
}

function readPersistedSession(): PersistedSession {
  const storedPage = loadPersistedState()
  let storedPromptAssist: string | null = null
  try {
    storedPromptAssist = window.localStorage.getItem(PROMPT_ASSIST_ENABLED_KEY)
  } catch {
    // Storage can be unavailable (private mode, quota); the defaults then apply.
  }
  return {
    componentTree: storedPage?.componentTree ?? null,
    activePage: storedPage?.activePage ?? null,
    pageBuilderMode: storedPage?.pageBuilderMode ?? null,
    toolbarMinimized: storedPage?.toolbarMinimized ?? null,
    promptAssistEnabled: storedPromptAssist === null ? null : storedPromptAssist === "true",
  }
}

/**
 * Hook that provides the global app state and dispatch function.
 * Every caller shares the one tab-wide store, so a single debounced save
 * writes to `livepage-page-storage` and no instance can clobber another.
 */
export function useAppState() {
  const { toast } = useToast()
  setToastRef = toast

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Adopt the browser-persisted session once per tab, after mount, so the
  // first render stays identical to the server HTML.
  useEffect(() => {
    if (hydrated) return
    hydrated = true
    dispatch({ type: "HYDRATE_FROM_STORAGE", payload: readPersistedSession() })
  }, [])

  return { state, dispatch }
}
