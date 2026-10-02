import { z } from "zod"
import { askJev, isJevConfigured, JevUnavailableError } from "@/server/services/jev"
import { completeJson, isOpenAiConfigured, OpenAiUnavailableError } from "@/server/services/openai"
import { describeRequest } from "./request"
import { designEditSchema, filterDesignEdits, type DesignEdit, type PageDescription, type PageRequest, type RefineResponse } from "@/shared/features/prompt-assist"

/** Jev's yes-probability at or above which the page is considered to match the request. */
const SATISFIED_AT = 0.8
const MAX_EDITS_PER_STEP = 8

async function judgeSatisfaction(goal: string, page: PageDescription): Promise<number | null> {
  if (!isJevConfigured()) return null
  try {
    const { satisfied } = await askJev({
      state: { goal, page: page.nodes },
      questions: {
        satisfied: {
          type: "noul",
          instructions:
            "Does the page described by `page` already look the way `goal` asks for, in its layout, spacing, colors, emphasis and tone? " +
            "Answer no if a clear part of `goal` is not reflected in the settings of the components.",
        },
      },
    })
    return satisfied.noul
  } catch (error) {
    if (!(error instanceof JevUnavailableError)) throw error
    console.warn("[prompt-assist] Jev unavailable for satisfaction check:", error.message)
    return null
  }
}

function resolveInDescription(page: PageDescription, edit: Pick<DesignEdit, "componentId" | "setting">) {
  const node = page.nodes.find((candidate) => candidate.id === edit.componentId)
  const setting = node ? page.settings[node.tag]?.find((candidate) => candidate.id === edit.setting) : undefined
  return node && setting ? { setting, current: node.settings[edit.setting] ?? "" } : null
}

const proposalSchema = z.object({ satisfied: z.boolean(), edits: z.array(designEditSchema).max(MAX_EDITS_PER_STEP) })

/**
 * One step of the design loop over a page that already has its template and
 * copy: Jev judges whether the page satisfies the request; if not, OpenAI
 * proposes the next bounded batch of edits, restricted to the settings the
 * page description lists for each component. Every edit is validated before it is
 * returned; the browser validates again against the live registry before applying.
 * The caller applies the edits and calls again until `done`.
 */
export async function refineDesign(request: PageRequest, page: PageDescription): Promise<RefineResponse> {
  const goal = describeRequest(request)

  const satisfaction = await judgeSatisfaction(goal, page)
  if (satisfaction !== null && satisfaction >= SATISFIED_AT) return { satisfaction, done: true, edits: [] }
  if (!isOpenAiConfigured()) return { satisfaction, done: true, edits: [] }

  try {
    const proposal = await completeJson({
      system:
        "You adjust the design settings of a web page so it matches what the person asked for. Propose only edits to existing components, using only the settings listed for that component's tag and, for select settings, only the listed options. " +
        "Do not change text content. Prefer a few impactful edits. Set `satisfied` to true only if the page already matches the request.",
      user: [
        `Request:\n${goal}`,
        `Settings available per tag:\n${JSON.stringify(page.settings)}`,
        `Current page (component id, tag, text preview, current settings):\n${JSON.stringify(page.nodes)}`,
        "Every edit's value must be a string.",
      ].join("\n\n"),
      schemaName: "design_edits",
      schema: proposalSchema,
    })
    const edits = filterDesignEdits(proposal.edits, (edit) => resolveInDescription(page, edit))
    // With no Jev judgment, the proposer's own verdict decides when to stop.
    const stop = satisfaction === null ? proposal.satisfied : false
    return { satisfaction, done: stop || edits.length === 0, edits }
  } catch (error) {
    if (!(error instanceof OpenAiUnavailableError)) throw error
    console.warn("[prompt-assist] design proposal failed:", error.message)
    return { satisfaction, done: true, edits: [] }
  }
}
