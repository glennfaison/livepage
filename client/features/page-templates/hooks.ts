"use client"

import { useEffect, useRef } from "react"
import type { Dispatch } from "react"
import type { AppAction } from "@/client/features/app-state"
import { createApplyPageTemplateActions } from "./actions"
import { getPageTemplateById } from "./registry"

export function usePageTemplateDeepLink(dispatch: Dispatch<AppAction>) {
  const deepLinkApplied = useRef(false)

  useEffect(() => {
    if (deepLinkApplied.current) return
    deepLinkApplied.current = true
    const params = new URLSearchParams(window.location.search)
    const template = getPageTemplateById(params.get("template") ?? "")
    if (template) {
      for (const action of createApplyPageTemplateActions(template)) dispatch(action)
    }
    const mode = params.get("mode")
    if (mode === "preview" || mode === "edit") {
      dispatch({ type: "SET_PAGE_BUILDER_MODE", payload: mode })
    }
  }, [dispatch])
}
