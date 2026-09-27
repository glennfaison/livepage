import type { PageTemplateDefinition } from "@/features/templates"
import type { PageBrief, TemplateCandidate, TemplateMatch } from "./schema"
import { rankTemplateCandidates, pickConfidentMatch, TOP_CANDIDATE_LIMIT } from "./select-template"
import { callJevChoice, JevUnavailableError } from "./jev-client"

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
      match: { templateId: confident.templateId, confidence: 1, decidedBy: "deterministic" },
    }
  }

  const shortlist = candidates.filter((candidate) => candidate.score > 0).slice(0, TOP_CANDIDATE_LIMIT)
  const fallback = shortlist[0] ?? candidates[0]

  if (!fallback) {
    // No template scored at all against this prompt; still return the
    // first bundled template so the chat always has something to offer.
    return {
      candidates,
      match: { templateId: templates[0]?.id ?? "", confidence: 0, decidedBy: "deterministic" },
    }
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
  }

  return {
    candidates,
    match: { templateId: fallback.templateId, confidence: 0.4, decidedBy: "jev-unavailable" },
  }
}
