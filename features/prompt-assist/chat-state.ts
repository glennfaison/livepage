import type { DesignEdit, PageRequest, TemplateCandidate } from "./schema"
import type { TemplateTextField } from "@/features/templates"

export type AssistMessage =
  | Readonly<{ id: string; role: "user" | "assistant"; kind: "text"; text: string }>
  | Readonly<{ id: string; role: "assistant"; kind: "error"; text: string }>
  | Readonly<{ id: string; role: "assistant"; kind: "clarify"; question: string; options: ReadonlyArray<string> }>

export type AssistStatus =
  | Readonly<{ phase: "idle" }>
  | Readonly<{ phase: "matching" }>
  | Readonly<{ phase: "drafting" }>
  | Readonly<{ phase: "refining"; step: number }>

/** A template with drafted copy and design edits, waiting for the person to apply or adjust it. */
export type Proposal = Readonly<{
  templateId: string
  /** null when the person picked the template themselves. */
  confidence: number | null
  decidedBy: "jev" | "openai" | "user"
  candidates: ReadonlyArray<TemplateCandidate>
  fields: ReadonlyArray<TemplateTextField>
  copy: Readonly<Record<string, string>>
  edits: ReadonlyArray<DesignEdit>
  satisfaction: number | null
  applied: boolean
}>

export type ChatState = Readonly<{
  messages: ReadonlyArray<AssistMessage>
  request: PageRequest | null
  /** The clarifying question the next message answers, if one is open. */
  pendingQuestion: string | null
  status: AssistStatus
  proposal: Proposal | null
  /** True after the server reported that no provider is configured, so the person must choose a template. */
  needsManualPick: boolean
}>

export type ChatEvent =
  | Readonly<{ type: "message"; message: AssistMessage }>
  | Readonly<{ type: "request"; request: PageRequest; pendingQuestion: string | null }>
  | Readonly<{ type: "status"; status: AssistStatus }>
  | Readonly<{ type: "proposal"; proposal: Proposal | null }>
  | Readonly<{ type: "copy"; source: string; value: string }>
  | Readonly<{ type: "needs-manual-pick" }>
  | Readonly<{ type: "applied" }>

export const initialChatState: ChatState = { messages: [], request: null, pendingQuestion: null, status: { phase: "idle" }, proposal: null, needsManualPick: false }

export function chatReducer(state: ChatState, event: ChatEvent): ChatState {
  switch (event.type) {
    case "message":
      return { ...state, messages: [...state.messages, event.message] }
    case "request":
      return { ...state, request: event.request, pendingQuestion: event.pendingQuestion, proposal: null, needsManualPick: false }
    case "status":
      return { ...state, status: event.status }
    case "proposal":
      return { ...state, proposal: event.proposal }
    case "copy":
      return state.proposal
        ? { ...state, proposal: { ...state.proposal, applied: false, copy: { ...state.proposal.copy, [event.source]: event.value } } }
        : state
    case "needs-manual-pick":
      return { ...state, needsManualPick: true }
    case "applied":
      return state.proposal ? { ...state, proposal: { ...state.proposal, applied: true } } : state
  }
}
