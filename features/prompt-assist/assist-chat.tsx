"use client"

import { MessageCircle, Send, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AppAction } from "@/features/app-state"
import { cn } from "@/lib/utils"
import { TemplateMatchCard } from "./template-match-card"
import { usePromptAssist } from "./use-prompt-assist"

/**
 * A minimizable/expandable chatbox for describing a page in plain language.
 * Closed, it's a floating round button (bottom-right); open, it's a small
 * panel with a message list and an input row — the same open/closed split
 * as Facebook's web chat widget, kept intentionally separate from the
 * page-builder Toolbar (features/page-builder/toolbar.tsx), which already
 * owns the bottom-center dock.
 */
export function AssistChat(props: Readonly<{ dispatch: (action: AppAction) => void }>) {
  const { dispatch } = props
  const [open, setOpen] = useState(false)
  const [draftText, setDraftText] = useState("")
  const { messages, isSending, sendPrompt, selectCandidate, updateDraftField, applyMatch } = usePromptAssist({
    dispatch,
  })
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [open, messages])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!draftText.trim()) return
    void sendPrompt(draftText)
    setDraftText("")
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open page assistant"
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex h-[28rem] w-80 flex-col overflow-hidden rounded-lg border bg-background shadow-xl">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">Page assistant</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Minimize page assistant"
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Describe the page you want — for example, &ldquo;a dark, minimal résumé site for a backend engineer named
            Priya&rdquo; — and I&apos;ll suggest a template to start from.
          </p>
        )}

        {messages.map((message) => {
          if (message.kind === "text") {
            return (
              <div
                key={message.id}
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                  message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {message.text}
              </div>
            )
          }

          if (message.kind === "error") {
            return (
              <div key={message.id} className="max-w-[85%] rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {message.text}
              </div>
            )
          }

          return (
            <TemplateMatchCard
              key={message.id}
              message={message}
              onSelectCandidate={(templateId) => selectCandidate(message.id, templateId)}
              onUpdateDraftField={(field, value) => updateDraftField(message.id, field, value)}
              onApply={() => applyMatch(message.id)}
            />
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-2">
        <Input
          value={draftText}
          onChange={(event) => setDraftText(event.target.value)}
          placeholder="Describe the page you want…"
          disabled={isSending}
        />
        <Button type="submit" size="icon" disabled={isSending || !draftText.trim()} aria-label="Send">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
