import type { PageTemplateDefinition } from "@/features/templates"
import type { PageBrief, TemplateCandidate, TemplateMatch } from "./schema"
import { rankTemplateCandidates, pickConfidentMatch, TOP_CANDIDATE_LIMIT } from "./select-template"
import { callJevChoice, JevUnavailableError } from "./jev-client"

/**
 * Maps the score lead over the runner-up to a 0.6-0.95 confidence. A win
 * by exactly the minimum margin is a weak signal, so it must not be
 * reported as 100%.
 */
function deterministicConfidence(top: TemplateCandidate, runnerUp: TemplateCandidate | undefined): number {
  if (!runnerUp) return 0.9
  const lead = top.score - runnerUp.score
  return Math.min(0.95, 0.6 + lead * 0.05)
}

/**
 * Resolves which bundled template best fits a PageBrief.
 *
 * The deterministic ranking in select-template.ts handles the clear cases
 * for free. Jev is called only for the one genuinely fuzzy judgment left
 * over: picking among a shortlist of near-tied candidates. If Jev is not
 * configured, unreachable, or answers outside the shortlist, this falls
 * back to the top deterministic candidate rather than failing the request.
 */
export async function decideTemplateMatch(
  brief: PageBrief,
  templates: ReadonlyArray<PageTemplateDefinition>,
): Promise<Readonly<{ match: TemplateMatch; candidates: ReadonlyArray<TemplateCandidate> }>> {
  const candidates = rankTemplateCandidates(brief, templates)
  const confident = pickConfidentMatch(candidates)

  if (confident) {
    return {
      candidates,
      match: { templateId: confident.templateId, confidence: deterministicConfidence(confident, candidates[1]), decidedBy: "deterministic" },
    }
  }

  const shortlist = candidates.filter((candidate) => candidate.score > 0).slice(0, TOP_CANDIDATE_LIMIT)
  const fallback = candidates[0]

  if (!fallback) {
    // Empty registry: nothing to match against.
    return { candidates, match: { templateId: "", confidence: 0, decidedBy: "fallback" } }
  }

  if (shortlist.length === 0) {
    // Nothing in the prompt overlapped any template. Offer the first one
    // as a starting point, but don't present it as a keyword match.
    return { candidates, match: { templateId: fallback.templateId, confidence: 0, decidedBy: "fallback" } }
  }

  if (shortlist.length < 2) {
    return {
      candidates,
      match: { templateId: fallback.templateId, confidence: 0.3, decidedBy: "deterministic" },
    }
  }

  try {
    const answer = await callJevChoice({
      questionId: "template",
      question: {
        type: "choice",
        instructions: "Which page template best fits the user's described page, given each option's name and category?",
        criteria: Object.fromEntries(
          shortlist.map((candidate) => [candidate.templateId, `${candidate.name} (${candidate.category})`]),
        ),
      },
      state: {
        prompt: brief.rawPrompt,
        toneHints: brief.toneHints,
        colorHints: brief.colorHints,
      },
    })

    if (shortlist.some((candidate) => candidate.templateId === answer.choice)) {
      return {
        candidates,
        match: { templateId: answer.choice, confidence: answer.confidence, decidedBy: "jev" },
      }
    }
  } catch (error) {
    if (!(error instanceof JevUnavailableError)) throw error
    if (process.env.TYPESAFE_API_KEY) console.warn("[prompt-assist] Jev unavailable, using best guess:", error.message)
  }

  return {
    candidates,
    match: { templateId: fallback.templateId, confidence: 0.4, decidedBy: "jev-unavailable" },
  }
}
