import type { AppNode } from "@/features/types"

import {
  LIVE_PAGE_AI_MAX_TRANSCRIPT_MESSAGES,
  livePageAIResponseSchema,
  type LivePageAIMessage,
  type LivePageAIProgressEvent,
  type LivePageAIResponse,
} from "./contracts"

export async function sendLivePageAiMessage(input: Readonly<{
  sessionId: string
  message: string
  componentTree: ReadonlyArray<AppNode>
  historyIndex: number
  transcript: ReadonlyArray<LivePageAIMessage>
  workflow?: {
    phase: "start" | "understanding" | "next" | "verify" | "complete"
    confirmed: boolean
    completedActionCount: number
    lastAction?: unknown
    guidance?: string
    observation?: {
      componentId?: string
      exists: boolean
      parentId?: string
      rendered: boolean
      validGeometry: boolean
      issues: ReadonlyArray<string>
    }
  }
  onProgress?: (event: LivePageAIProgressEvent) => void
}>): Promise<LivePageAIResponse> {
  const response = await fetch("/api/livepage-ai", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      sessionId: input.sessionId,
      prompt: input.message,
      currentPage: input.componentTree,
      historyIndex: input.historyIndex,
      transcript: input.transcript.slice(-LIVE_PAGE_AI_MAX_TRANSCRIPT_MESSAGES),
      ...(input.workflow ? { workflow: input.workflow } : {}),
    }),
  })
  const body: unknown = await response.json()
  if (!response.ok) throw new Error(body && typeof body === "object" && "error" in body ? String(body.error) : "LivePageAI is unavailable.")
  const result = livePageAIResponseSchema.parse(body)
  if (input.onProgress) result.progress.forEach(input.onProgress)
  return result
}
