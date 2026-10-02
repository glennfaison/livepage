import type { AppNode } from "@/client/features/app-state"
import { applyDesignEdits, validateDesignEdits } from "./design-edits"
import type { DesignEdit, RefineResponse } from "@/shared/features/prompt-assist"

export const MAX_REFINE_STEPS = 4

export type RefinementResult = Readonly<{
  /** The net edits relative to the starting pages, ready for applyDesignEdits. */
  edits: ReadonlyArray<DesignEdit>
  /** The last satisfaction probability Jev reported, if it judged at all. */
  satisfaction: number | null
}>

/**
 * Runs the design loop until the goal is met or it stops making progress:
 * ask `requestStep` how the current page fares and what to change, apply the
 * validated edits, and repeat. It stops when a step reports `done`, proposes
 * no edit that changes anything (which also ends oscillation), or after
 * `maxSteps`, so a misbehaving provider cannot loop forever.
 */
export async function refinePage(
  params: Readonly<{
    pages: ReadonlyArray<AppNode>
    requestStep: (pages: ReadonlyArray<AppNode>) => Promise<RefineResponse>
    maxSteps?: number
    onStep?: (step: number) => void
  }>,
): Promise<RefinementResult> {
  const { pages, requestStep, maxSteps = MAX_REFINE_STEPS, onStep } = params
  let edits: ReadonlyArray<DesignEdit> = []
  let current = pages
  let satisfaction: number | null = null

  for (let step = 1; step <= maxSteps; step += 1) {
    onStep?.(step)
    const response = await requestStep(current)
    satisfaction = response.satisfaction ?? satisfaction

    const fresh = validateDesignEdits(current, response.edits)
    edits = [...edits, ...fresh]
    current = applyDesignEdits(current, fresh)
    if (response.done || fresh.length === 0) break
  }

  // Later edits to the same setting supersede earlier ones; drop settings that ended where they began.
  return { edits: validateDesignEdits(pages, edits), satisfaction }
}
