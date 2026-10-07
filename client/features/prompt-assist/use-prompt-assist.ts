"use client"

import { useCallback, useReducer } from "react"
import { toast } from "@/client/components/ui/use-toast"
import type { AppAction } from "@/client/features/app-state"
import {
  applyTemplateFieldValues,
  createApplyTemplateActions,
  describeTemplateCatalog,
  getPageTemplateById,
  listTemplateTextFields,
  type PageTemplateDefinition,
} from "@/client/features/templates"
import { generateId } from "@/client/lib/utils"
import { promptAssistApi, RateLimitedError } from "./api"
import { chatReducer, initialChatState, type AssistMessage, type Proposal } from "./chat-state"
import { composePages } from "./compose-pages"
import { applyDesignEdits } from "./design-edits"
import { refinePage } from "./refine-loop"
import type { PageRequest } from "@/shared/features/prompt-assist"
import { logger } from "@/client/lib/logger"

const catalog = describeTemplateCatalog()

const assistantText = (text: string): AssistMessage => ({ id: generateId(), role: "assistant", kind: "text", text })
const errorMessage = (error: unknown): AssistMessage => ({
  id: generateId(),
  role: "assistant",
  kind: "error",
  text:
    error instanceof RateLimitedError
      ? "You're sending requests too quickly. Wait a moment and try again."
      : "Something went wrong while working on that. Try again, or describe the page a little differently.",
})

/**
 * Owns the prompt-assist conversation: match a template (asking clarifying
 * questions when needed), draft its copy, run the design loop, then hold the
 * result as a proposal until the person applies it through the app-state
 * actions in one history entry.
 */
export function usePromptAssist(params: Readonly<{ dispatch: (action: AppAction) => void }>) {
  const { dispatch } = params
  const [state, emit] = useReducer(chatReducer, initialChatState)
  const busy = state.status.phase !== "idle"

  /** Drafts copy for `template`, then loops on design settings until the request is met. */
  const buildProposal = useCallback(async (request: PageRequest, template: PageTemplateDefinition, origin: Pick<Proposal, "confidence" | "decidedBy" | "candidates">) => {
    emit({ type: "status", status: { phase: "drafting" } })
    const draft = await promptAssistApi.draft(request, template)

    const basePages = composePages(template, draft.values, [])
    // A failed design loop should not discard the template and copy that already worked.
    const refinement = await refinePage({
      pages: basePages,
      requestStep: (pages) => promptAssistApi.refine(request, pages),
      onStep: (step) => emit({ type: "status", status: { phase: "refining", step } }),
    }).catch((error: unknown) => {
      emit({ type: "message", message: assistantText("I couldn't finish tuning the design, so this uses the template's own styling. You can still adjust it after applying.") })
      logger.warn("[prompt-assist] design loop failed:", { error })
      return { edits: [], satisfaction: null }
    })

    emit({
      type: "proposal",
      proposal: {
        ...origin,
        templateId: template.id,
        fields: listTemplateTextFields(template),
        copy: draft.values,
        edits: refinement.edits,
        satisfaction: refinement.satisfaction,
        applied: false,
      },
    })
  }, [])

  const run = useCallback(
    async (request: PageRequest, pendingBuild?: Readonly<{ templateId: string }>) => {
      try {
        if (pendingBuild) {
          const template = getPageTemplateById(pendingBuild.templateId)
          if (!template) throw new Error("Unknown template")
          await buildProposal(request, template, { confidence: null, decidedBy: "user", candidates: [] })
          return
        }

        emit({ type: "status", status: { phase: "matching" } })
        const match = await promptAssistApi.match(request, catalog)

        if (match.kind === "unavailable") {
          emit({ type: "needs-manual-pick" })
          emit({ type: "message", message: assistantText("No AI provider is configured on this server, so I can't choose a template for you. Pick one below to start from.") })
          return
        }
        if (match.kind === "clarify") {
          emit({ type: "request", request, pendingQuestion: match.question })
          emit({ type: "message", message: { id: generateId(), role: "assistant", kind: "clarify", question: match.question, options: match.options } })
          return
        }

        const template = getPageTemplateById(match.templateId)
        if (!template) throw new Error("Matched an unknown template")
        await buildProposal(request, template, { confidence: match.confidence, decidedBy: match.decidedBy, candidates: match.candidates })
      } catch (error) {
        emit({ type: "message", message: errorMessage(error) })
      } finally {
        emit({ type: "status", status: { phase: "idle" } })
      }
    },
    [buildProposal],
  )

  const send = useCallback(
    (rawText: string) => {
      const text = rawText.trim()
      if (!text || busy) return
      emit({ type: "message", message: { id: generateId(), role: "user", kind: "text", text } })

      const request: PageRequest =
        state.request && state.pendingQuestion
          ? { ...state.request, clarifications: [...state.request.clarifications, { question: state.pendingQuestion, answer: text }] }
          : { prompt: text, clarifications: [] }
      emit({ type: "request", request, pendingQuestion: null })
      void run(request)
    },
    [busy, run, state.pendingQuestion, state.request],
  )

  /** The person chose a template themselves; rebuild the proposal around it. */
  const pickTemplate = useCallback(
    (templateId: string) => {
      if (busy) return
      const request = state.request ?? { prompt: `A page using the "${getPageTemplateById(templateId)?.metadata.name ?? templateId}" template`, clarifications: [] }
      emit({ type: "request", request, pendingQuestion: null })
      void run(request, { templateId })
    },
    [busy, run, state.request],
  )

  const editCopy = useCallback((source: string, value: string) => emit({ type: "copy", source, value }), [])

  const apply = useCallback(() => {
    const { proposal } = state
    const template = proposal ? getPageTemplateById(proposal.templateId) : undefined
    if (!proposal || !template) {
      toast({ title: "Couldn't apply that template", description: "It may have been removed from the catalog." })
      return
    }
    for (const action of createApplyTemplateActions(template, {
      customizePages: (pages) => applyDesignEdits(applyTemplateFieldValues(pages, template, proposal.copy), proposal.edits),
      historyLabel: `Applied "${template.metadata.name}" from prompt assist`,
    })) {
      dispatch(action)
    }
    toast({ title: "Template applied", description: template.metadata.name })
    emit({ type: "applied" })
  }, [dispatch, state])

  return { ...state, busy, catalog, send, pickTemplate, editCopy, apply }
}

export type PromptAssist = ReturnType<typeof usePromptAssist>
