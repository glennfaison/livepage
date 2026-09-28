"use client"

import { useCallback, useState } from "react"
import { toast } from "@/components/ui/use-toast"
import type { AppAction } from "@/features/app-state"
import { getPageTemplateById, type PageTemplateDefinition } from "@/features/templates"
import { generateId } from "@/lib/utils"
import { createApplyPromptTemplateActions, type PromptFieldValues } from "./apply-brief"
import {
  draftResponseSchema,
  matchResponseSchema,
  type PageBrief,
  type PromptDraft,
  type TemplateCandidate,
  type TemplateMatch,
} from "./schema"

export type AssistMessage =
  | Readonly<{ id: string; role: "user"; kind: "text"; text: string }>
  | Readonly<{ id: string; role: "assistant"; kind: "text"; text: string }>
  | Readonly<{ id: string; role: "assistant"; kind: "error"; text: string }>
  | Readonly<{
      id: string
      role: "assistant"
      kind: "match"
      prompt: string
      brief: PageBrief
      match: TemplateMatch
      candidates: ReadonlyArray<TemplateCandidate>
      draft: PromptDraft | null
      draftSource: "openai" | "fallback" | null
      draftLoading: boolean
      applied: boolean
    }>

type MatchMessage = Extract<AssistMessage, { kind: "match" }>

function updateMatchMessage(
  messages: ReadonlyArray<AssistMessage>,
  id: string,
  update: (message: MatchMessage) => MatchMessage,
): ReadonlyArray<AssistMessage> {
  return messages.map((message) => (message.id === id && message.kind === "match" ? update(message) : message))
}

export function usePromptAssist(params: Readonly<{ dispatch: (action: AppAction) => void }>) {
  const { dispatch } = params
  const [messages, setMessages] = useState<ReadonlyArray<AssistMessage>>([])
  const [isSending, setIsSending] = useState(false)

  const loadDraft = useCallback(async (messageId: string, brief: PageBrief, templateId: string, prompt: string) => {
    // A slower response for a template the person has already moved away
    // from must not overwrite the draft for the template now selected.
    const applyIfCurrent = (update: (message: MatchMessage) => MatchMessage) =>
      setMessages((prev) =>
        updateMatchMessage(prev, messageId, (message) => (message.match.templateId === templateId ? update(message) : message)),
      )

    try {
      const response = await fetch("/api/prompt-assist/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, templateId }),
      })
      if (!response.ok) throw new Error(`Request failed with ${response.status}`)
      const json = draftResponseSchema.parse(await response.json())
      applyIfCurrent((message) => ({ ...message, draft: json.draft, draftSource: json.source, draftLoading: false }))
    } catch {
      applyIfCurrent((message) => ({
        ...message,
        draft: { name: brief.name, headline: brief.headline },
        draftSource: "fallback",
        draftLoading: false,
      }))
    }
  }, [])

  const sendPrompt = useCallback(
    async (rawText: string) => {
      const text = rawText.trim()
      if (!text || isSending) return

      setMessages((prev) => [...prev, { id: generateId(), role: "user", kind: "text", text }])
      setIsSending(true)

      try {
        const response = await fetch("/api/prompt-assist/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text }),
        })
        if (!response.ok) throw new Error(`Request failed with ${response.status}`)
        const json = matchResponseSchema.parse(await response.json())

        const matchMessageId = generateId()
        setMessages((prev) => [
          ...prev,
          {
            id: matchMessageId,
            role: "assistant",
            kind: "match",
            prompt: text,
            brief: json.brief,
            match: json.match,
            candidates: json.candidates,
            draft: null,
            draftSource: null,
            draftLoading: true,
            applied: false,
          },
        ])

        await loadDraft(matchMessageId, json.brief, json.match.templateId, text)
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "assistant",
            kind: "error",
            text: "I couldn't work out a template for that. Try describing the kind of page you want and its tone.",
          },
        ])
      } finally {
        setIsSending(false)
      }
    },
    [isSending, loadDraft],
  )

  const selectCandidate = useCallback(
    (messageId: string, templateId: string) => {
      const message = messages.find((candidate) => candidate.id === messageId)
      if (!message || message.kind !== "match") return

      setMessages((prev) =>
        updateMatchMessage(prev, messageId, (current) => ({
          ...current,
          match: { templateId, confidence: 1, decidedBy: "user" },
          draft: null,
          draftSource: null,
          draftLoading: true,
          applied: false,
        })),
      )
      void loadDraft(messageId, message.brief, templateId, message.prompt)
    },
    [loadDraft, messages],
  )

  const updateDraftField = useCallback((messageId: string, field: keyof PromptDraft, value: string) => {
    setMessages((prev) =>
      updateMatchMessage(prev, messageId, (message) => ({
        ...message,
        draft: { ...(message.draft ?? {}), [field]: value },
      })),
    )
  }, [])

  const applyMatch = useCallback(
    (messageId: string) => {
      const message = messages.find((candidate) => candidate.id === messageId)
      if (!message || message.kind !== "match") return

      const template: PageTemplateDefinition | undefined = getPageTemplateById(message.match.templateId)
      if (!template) {
        toast({ title: "Couldn't apply that template", description: "It may have been removed from the catalog." })
        return
      }

      const fieldValues: PromptFieldValues = {
        name: message.draft?.name ?? message.brief.name,
        headline: message.draft?.headline ?? message.brief.headline,
        summary: message.draft?.summary,
      }

      for (const action of createApplyPromptTemplateActions(
        template,
        fieldValues,
        `Applied "${template.metadata.name}" from prompt assist`,
      )) {
        dispatch(action)
      }

      toast({ title: "Template applied", description: template.metadata.name })
      setMessages((prev) => updateMatchMessage(prev, messageId, (current) => ({ ...current, applied: true })))
    },
    [dispatch, messages],
  )

  return { messages, isSending, sendPrompt, selectCandidate, updateDraftField, applyMatch }
}
