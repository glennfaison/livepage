"use client"

import { useSearchParams } from "next/navigation"

/** The chat is opt-in: it only appears on pages opened with `?prompt-assist=1`. */
const PROMPT_ASSIST_QUERY_PARAM = "prompt-assist"

/**
 * Whether the current URL opts in to prompt assist. Only visibility is gated:
 * the /api/prompt-assist routes stay reachable and are protected by provider
 * keys, input validation and rate limits, not by this flag.
 * Reads the query string, so callers must render inside a Suspense boundary.
 */
export function usePromptAssistEnabled(): boolean {
  return useSearchParams().get(PROMPT_ASSIST_QUERY_PARAM) === "1"
}
