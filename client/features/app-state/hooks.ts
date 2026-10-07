"use client"

import { useEffect, useReducer } from "react"
import { appReducer, initialState, createInitialState } from "@/client/features/app-state/commands/reducer"

const PROMPT_ASSIST_ENABLED_KEY = "livepage-prompt-assist-enabled"

/**
 * Hook that provides the global app state and dispatch function.
 * Initializes history with the first page if history is empty.
 */
export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialState)

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
  }, [state.componentTree, state.history])

  useEffect(() => {
    try {
      window.localStorage.setItem(PROMPT_ASSIST_ENABLED_KEY, String(state.promptAssistEnabled))
    } catch {
      // Ignore localStorage errors (e.g., private browsing, quota exceeded)
    }
  }, [state.promptAssistEnabled])

  return { state, dispatch }
}
