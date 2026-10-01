import { Check, LayoutTemplate, Loader2, Palette, Sparkles } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import type { TemplateSummary } from "@/client/features/templates"
import type { Proposal } from "./chat-state"

const DECIDED_BY_LABEL: Readonly<Record<Proposal["decidedBy"], string>> = {
  jev: "Matched by Jev",
  openai: "Matched by OpenAI",
  user: "Your pick",
}

const percent = (probability: number) => `${Math.round(probability * 100)}%`

export function ProposalCard(
  props: Readonly<{
    proposal: Proposal
    catalog: ReadonlyArray<TemplateSummary>
    onPickTemplate: (templateId: string) => void
    onEditCopy: (source: string, value: string) => void
    onApply: () => void
  }>,
) {
  const { proposal, catalog, onPickTemplate, onEditCopy, onApply } = props
  const template = catalog.find((entry) => entry.id === proposal.templateId)

  return (
    <div className="w-full rounded-lg border bg-card p-3 text-sm shadow-sm">
      <div className="flex items-start gap-2">
        <LayoutTemplate className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-tight">{template?.name ?? "Unknown template"}</p>
          <p className="text-xs text-muted-foreground">
            {template?.category} · {DECIDED_BY_LABEL[proposal.decidedBy]}
            {proposal.confidence === null ? null : ` · ${percent(proposal.confidence)}`}
          </p>
        </div>
      </div>

      <label className="mt-2 block">
        <span className="mb-1 block text-xs text-muted-foreground">Template</span>
        <select
          value={proposal.templateId}
          onChange={(event) => onPickTemplate(event.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
        >
          {catalog.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.name}
            </option>
          ))}
        </select>
      </label>

      <details className="mt-3 text-xs">
        <summary className="flex cursor-pointer items-center gap-1 text-muted-foreground">
          <Palette className="h-3 w-3" />
          {proposal.edits.length === 0 ? "No design changes" : `${proposal.edits.length} design changes`}
          {proposal.satisfaction === null ? null : ` · fit ${percent(proposal.satisfaction)}`}
        </summary>
        <ul className="mt-1 space-y-1 pl-4">
          {proposal.edits.map((edit) => (
            <li key={`${edit.componentId}:${edit.setting}`}>
              <span className="font-mono">{edit.setting}</span> → {edit.value}
              {edit.reason ? <span className="text-muted-foreground"> — {edit.reason}</span> : null}
            </li>
          ))}
        </ul>
      </details>

      {proposal.fields.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            {Object.values(proposal.copy).some(Boolean) ? "Drafted copy" : "Template text (edit to replace)"}
          </div>
          {proposal.fields.map((field) => (
            <label key={field.source} className="block">
              <span className="mb-1 block text-xs text-muted-foreground">{field.description}</span>
              <Input value={proposal.copy[field.source] ?? ""} onChange={(event) => onEditCopy(field.source, event.target.value)} />
            </label>
          ))}
        </div>
      )}

      <Button type="button" size="sm" className="mt-3 w-full" disabled={proposal.applied || !template} onClick={onApply}>
        {proposal.applied ? (
          <>
            <Check className="mr-1 h-4 w-4" /> Applied
          </>
        ) : (
          "Apply to canvas"
        )}
      </Button>
    </div>
  )
}

export function StatusLine(props: Readonly<{ text: string }>) {
  return (
    <p className="flex items-center gap-2 text-xs text-muted-foreground" role="status">
      <Loader2 className="h-3 w-3 animate-spin" />
      {props.text}
    </p>
  )
}
