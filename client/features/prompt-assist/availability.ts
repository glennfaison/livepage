"use client"

import { useSearchParams } from "next/navigation"

/** On top of the deployment flag, the chat is opt-in per page load: it only appears when opened with `?prompt-assist=1`. */
const PROMPT_ASSIST_QUERY_PARAM = "prompt-assist"

/**
 * Whether the current URL opts in to prompt assist. This is only the per-visit
 * switch: whether the feature exists at all is decided by the deployment flag.
 * Reads the query string, so callers must render inside a Suspense boundary.
 */
export function usePromptAssistEnabled(): boolean {
  return useSearchParams().get(PROMPT_ASSIST_QUERY_PARAM) === "1"
}
