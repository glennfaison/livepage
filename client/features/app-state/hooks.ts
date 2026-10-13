"use client"

import { useEffect, useReducer, useRef, useCallback } from "react"
import { appReducer, initialState } from "@/client/features/app-state/commands/reducer"
import type { AppState, PersistedSession } from "@/client/features/types"

const PROMPT_ASSIST_ENABLED_KEY = "livepage-prompt-assist-enabled"
const PAGE_STORAGE_KEY = "livepage-page-storage"
const PAGE_STORAGE_VERSION = 1

interface PersistedPageState {
  version: number
  componentTree: AppState["componentTree"]
  activePage: string
  pageBuilderMode: AppState["pageBuilderMode"]
  toolbarMinimized: boolean
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

function savePersistedState(state: AppState) {
  if (typeof window === "undefined") return
  try {
    const toPersist: PersistedPageState = {
      version: PAGE_STORAGE_VERSION,
      componentTree: state.componentTree,
      activePage: state.activePage,
      pageBuilderMode: state.pageBuilderMode,
      toolbarMinimized: state.toolbarMinimized,
    }
    window.localStorage.setItem(PAGE_STORAGE_KEY, JSON.stringify(toPersist))
  } catch {
    // Ignore quota exceeded or other storage errors
  }
}

/**
 * Reads the browser-persisted session. localStorage is unavailable during
 * server rendering, so this is dispatched in a mount effect and not read while
 * rendering: reading it during the first client render would diverge from the
 * server HTML and fail hydration. Fields that were never stored hydrate as
 * `null` and keep the reducer's default.
 */
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
 * Seeds the initial history entry from the starting page, adopts the
 * browser-persisted session after mount, and persists the page state and the
 * promptAssistEnabled setting to localStorage.
 */
export function useAppState() {
  const [state, baseDispatch] = useReducer(appReducer, initialState)
  const dispatchRef = useRef(baseDispatch)
  dispatchRef.current = baseDispatch

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debouncedSave = useCallback((newState: AppState) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      savePersistedState(newState)
    }, 500)
  }, [])

  const dispatch = useRef((action: Parameters<typeof baseDispatch>[0]) => {
    baseDispatch(action)
    if (action.type === "SET_PROMPT_ASSIST_ENABLED") {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(PROMPT_ASSIST_ENABLED_KEY, String(action.payload))
      }
    }
  }).current

  // Adopt the browser-persisted session after mount so the first render stays
  // identical to the server HTML. The reducer seeds the initial history entry
  // from the adopted tree, so undo and discard start from the restored session.
  useEffect(() => {
    dispatch({ type: "HYDRATE_FROM_STORAGE", payload: readPersistedSession() })
  }, [dispatch])

  useEffect(() => {
    debouncedSave(state)
  }, [state.componentTree, state.history, state.activePage, state.pageBuilderMode, state.toolbarMinimized, dispatch, debouncedSave])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Persist promptAssistEnabled to localStorage (also handled in dispatch above for immediate sync)
  useEffect(() => {
    try {
      window.localStorage.setItem(PROMPT_ASSIST_ENABLED_KEY, String(state.promptAssistEnabled))
    } catch {
      // Ignore localStorage errors (e.g., private browsing, quota exceeded)
    }
  }, [state.promptAssistEnabled])

  return { state, dispatch }
}