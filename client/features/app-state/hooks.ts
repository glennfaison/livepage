"use client"

import { useEffect, useReducer, useRef } from "react"
import { appReducer, initialState } from "@/client/features/app-state/commands/reducer"

const PROMPT_ASSIST_ENABLED_KEY = "livepage-prompt-assist-enabled"

/**
 * Hook that provides the global app state and dispatch function.
 * Initializes history with the first page if history is empty.
 * Persists promptAssistEnabled setting to localStorage.
 */
export function useAppState() {
  const [state, baseDispatch] = useReducer(appReducer, initialState, (initial) => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(PROMPT_ASSIST_ENABLED_KEY)
      if (stored !== null) {
        return { ...initial, promptAssistEnabled: stored === "true" }
      }
    }
    return initial
  })

  const dispatchRef = useRef(baseDispatch)
  dispatchRef.current = baseDispatch

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
  }, [state.componentTree, state.history, dispatch])

  return { state, dispatch }
}
