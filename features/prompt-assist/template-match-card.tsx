"use client"

import { Check, LayoutTemplate, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getPageTemplateById } from "@/features/templates"
import { cn } from "@/lib/utils"
import type { AssistMessage } from "./use-prompt-assist"

type MatchMessage = Extract<AssistMessage, { kind: "match" }>

const DECISION_LABEL: Readonly<Record<MatchMessage["match"]["decidedBy"], string>> = {
  deterministic: "Matched by keyword",
  jev: "Matched by Jev",
  "jev-unavailable": "Best guess",
  fallback: "No close match",
  user: "Your pick",
}

export function TemplateMatchCard(
  props: Readonly<{
    message: MatchMessage
    onSelectCandidate: (templateId: string) => void
    onUpdateDraftField: (field: "name" | "headline" | "summary", value: string) => void
    onApply: () => void
  }>,
) {
  const { message, onSelectCandidate, onUpdateDraftField, onApply } = props
  const template = getPageTemplateById(message.match.templateId)
  // When nothing overlapped the prompt every score is 0; still offer
  // alternatives so the person isn't stuck with an arbitrary template.
  const anyScored = message.candidates.some((candidate) => candidate.score > 0)
  const alternates = message.candidates.filter(
    (candidate) => candidate.templateId !== message.match.templateId && (!anyScored || candidate.score > 0),
  )

  return (
    <div className="w-full rounded-lg border bg-card p-3 text-sm shadow-sm">
      <div className="flex items-start gap-2">
        <LayoutTemplate className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-tight">{template?.metadata.name ?? "Unknown template"}</p>
          <p className="text-xs text-muted-foreground">
            {template?.metadata.category} · {DECISION_LABEL[message.match.decidedBy]}
            {message.match.decidedBy === "fallback" || message.match.decidedBy === "user" ? null : (
              <>
                {" · "}
                {Math.round(message.match.confidence * 100)}% confidence
              </>
            )}
          </p>
        </div>
      </div>

      {alternates.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {alternates.slice(0, 3).map((candidate) => (
            <button
              key={candidate.templateId}
              type="button"
              onClick={() => onSelectCandidate(candidate.templateId)}
              className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Use &ldquo;{candidate.name}&rdquo; instead
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          {message.draftLoading ? "Drafting copy…" : message.draftSource === "openai" ? "Drafted copy" : "Using your prompt as-is"}
        </div>

        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Name</span>
          <Input
            value={message.draft?.name ?? ""}
            placeholder="Page owner's name"
            disabled={message.draftLoading}
            onChange={(event) => onUpdateDraftField("name", event.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Headline</span>
          <Input
            value={message.draft?.headline ?? ""}
            placeholder="Short headline"
            disabled={message.draftLoading}
            onChange={(event) => onUpdateDraftField("headline", event.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Summary</span>
          <textarea
            value={message.draft?.summary ?? ""}
            placeholder="A sentence or two of summary copy"
            disabled={message.draftLoading}
            onChange={(event) => onUpdateDraftField("summary", event.target.value)}
            rows={3}
            className={cn(
              "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            )}
          />
        </label>
      </div>

      <Button
        type="button"
        size="sm"
        className="mt-3 w-full"
        disabled={message.draftLoading || message.applied || !template}
        onClick={onApply}
      >
        {message.applied ? (
          <>
            <Check className="mr-1 h-4 w-4" /> Applied
          </>
        ) : message.draftLoading ? (
          <>
            <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Preparing…
          </>
        ) : (
          "Apply to canvas"
        )}
      </Button>
    </div>
  )
}
