"use client"

import { useEffect, useReducer } from "react"
import { appReducer, initialState } from "./commands/reducer"

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, initialState)

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

  return { state, dispatch }
}
