"use client"

import { useEffect, useReducer, useRef, useCallback } from "react"
import { appReducer, initialState } from "@/client/features/app-state/commands/reducer"
import type { AppState } from "@/client/features/types"

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
 * Hook that provides the global app state and dispatch function.
 * Initializes history with the first page if history is empty.
 * Persists promptAssistEnabled setting and page state to localStorage.
 */
export function useAppState() {
  const [state, baseDispatch] = useReducer(appReducer, initialState, (initial) => {
    if (typeof window !== "undefined") {
      const storedPromptAssist = window.localStorage.getItem(PROMPT_ASSIST_ENABLED_KEY)
      const storedPage = loadPersistedState()
      let merged = initial
      if (storedPromptAssist !== null) {
        merged = { ...merged, promptAssistEnabled: storedPromptAssist === "true" }
      }
      if (storedPage) {
        merged = {
          ...merged,
          componentTree: storedPage.componentTree,
          activePage: storedPage.activePage,
          pageBuilderMode: storedPage.pageBuilderMode,
          toolbarMinimized: storedPage.toolbarMinimized,
        }
      }
      return merged
    }
    return initial
  })

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

  useEffect(() => {
    if (state.componentTree.length > 0 && state.history.length === 0) {
      dispatch({
        type: "ADD_TO_HISTORY",
        payload: {
          action: "Page created",
          pageState: state.componentTree,
        },
      })
      dispatch({ type: "SET_CURRENT_HISTORY_INDEX", payload: 0 })
    }
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

  return { state, dispatch }
}
