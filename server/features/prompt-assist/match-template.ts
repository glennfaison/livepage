import { z } from "zod"
import { askJev, isJevConfigured, JevUnavailableError, type JevChoiceAnswer } from "@/server/services/jev"
import { completeJson, isOpenAiConfigured, OpenAiUnavailableError } from "@/server/services/openai"
import { describeRequest } from "./request"
import {
  MAX_CLARIFICATIONS,
  type MatchRequest,
  type MatchResponse,
  type PageRequest,
  type TemplateCandidate,
  type TemplateSummary,
} from "@/shared/features/prompt-assist"
import { logger } from "@/server/lib/logger"

const NO_MATCH = "none"
const CANDIDATE_LIMIT = 4
// A Jev Choice `confidence` is normalized entropy over *all* options, so a coin-flip
// between two of eleven options still reads as fairly confident. Ambiguity is
// therefore judged on the probabilities themselves.
const MIN_TOP_PROBABILITY = 0.55
const MIN_LEAD_OVER_RUNNER_UP = 0.2

type Ranking = Readonly<{ candidates: ReadonlyArray<TemplateCandidate>; noMatch: boolean; decidedBy: "jev" | "openai" }>

/** Jev picks among the client-supplied catalog or abstains with "none". */
async function rankWithJev(request: PageRequest, catalog: ReadonlyArray<TemplateSummary>): Promise<Ranking> {
  const { template } = await askJev({
    state: { request: request.prompt, clarifications: request.clarifications, templates: catalog },
    questions: {
      template: {
        type: "choice",
        instructions:
          "Which entry of `templates` best fits the page described in `request`, taking `clarifications` into account? " +
          "Judge by each template's purpose, category, description and tags.",
        criteria: {
          ...Object.fromEntries(catalog.map((entry) => [entry.id, `The template "${entry.name}" (${entry.category})`])),
          [NO_MATCH]: "No template clearly fits the described page",
        },
      },
    },
  })
  return { ...rankingFromJev(template, catalog), decidedBy: "jev" }
}

function rankingFromJev(answer: JevChoiceAnswer, catalog: ReadonlyArray<TemplateSummary>): Omit<Ranking, "decidedBy"> {
  const nameById = new Map(catalog.map((entry) => [entry.id, entry.name]))
  const candidates = Object.entries(answer.probabilities)
    .filter(([id]) => nameById.has(id))
    .map(([templateId, probability]) => ({ templateId, name: nameById.get(templateId) ?? templateId, probability }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, CANDIDATE_LIMIT)
  return { candidates, noMatch: answer.choice === NO_MATCH }
}

/** Fallback judge when Jev is not configured or unavailable. */
async function rankWithOpenAi(request: PageRequest, catalog: ReadonlyArray<TemplateSummary>): Promise<Ranking> {
  const ids = catalog.map((entry) => entry.id)
  const reply = await completeJson({
    system: "You pick the single best page template for a website request. Reply only with the requested JSON.",
    user: `Request:\n${describeRequest(request)}\n\nTemplates:\n${JSON.stringify(catalog)}\n\nReturn the id of the best template, or "${NO_MATCH}" if none clearly fits, and your confidence from 0 to 1.`,
    schemaName: "template_match",
    schema: z.object({ templateId: z.string(), confidence: z.number().min(0).max(1) }),
  })
  const chosen = catalog.find((entry) => entry.id === reply.templateId)
  if (!chosen || !ids.includes(reply.templateId)) return { candidates: [], noMatch: true, decidedBy: "openai" }
  return { candidates: [{ templateId: chosen.id, name: chosen.name, probability: reply.confidence }], noMatch: false, decidedBy: "openai" }
}

function isAmbiguous(ranking: Ranking): boolean {
  const [top, runnerUp] = ranking.candidates
  if (ranking.noMatch || !top) return true
  return top.probability < MIN_TOP_PROBABILITY || top.probability - (runnerUp?.probability ?? 0) < MIN_LEAD_OVER_RUNNER_UP
}

/** Jev cannot write prose, so OpenAI phrases the one question that best separates the leading candidates. */
async function askClarifyingQuestion(request: PageRequest, ranking: Ranking, catalog: ReadonlyArray<TemplateSummary>): Promise<MatchResponse | null> {
  if (!isOpenAiConfigured() || request.clarifications.length >= MAX_CLARIFICATIONS) return null
  const leading = ranking.candidates.length > 0 ? ranking.candidates.map((c) => c.templateId) : catalog.map((entry) => entry.id)
  const options = catalog.filter((entry) => leading.includes(entry.id))
  try {
    const reply = await completeJson({
      system: "You help someone choose a website template. Ask exactly one short, friendly question whose answer would best tell the candidate templates apart. Offer up to 4 short answer options, or none if the question is open-ended.",
      user: `Request so far:\n${describeRequest(request)}\n\nCandidate templates:\n${JSON.stringify(options)}`,
      schemaName: "clarifying_question",
      schema: z.object({ question: z.string().min(1).max(300), options: z.array(z.string().min(1).max(80)).max(4) }),
    })
    return { kind: "clarify", question: reply.question, options: reply.options }
  } catch (error) {
    if (!(error instanceof OpenAiUnavailableError)) throw error
    logger.warn("[prompt-assist] clarifying question failed, using best guess:", { error: error.message })
    return null
  }
}

/**
 * Chooses the template that best fits a request. Jev judges against the
 * validated catalog supplied by the client (OpenAI is the fallback judge); when
 * the judgment is ambiguous, OpenAI asks the person one clarifying question,
 * up to MAX_CLARIFICATIONS times, before settling for the best candidate.
 */
export async function matchTemplate(input: MatchRequest): Promise<MatchResponse> {
  const { catalog, ...request } = input
  let ranking: Ranking | null = null

  if (isJevConfigured()) {
    try {
      ranking = await rankWithJev(request, catalog)
    } catch (error) {
      if (!(error instanceof JevUnavailableError)) throw error
      logger.warn("[prompt-assist] Jev unavailable, falling back to OpenAI:", { error: error.message })
    }
  }
  if (!ranking && isOpenAiConfigured()) {
    try {
      ranking = await rankWithOpenAi(request, catalog)
    } catch (error) {
      if (!(error instanceof OpenAiUnavailableError)) throw error
      logger.warn("[prompt-assist] OpenAI template match failed:", { error: error.message })
    }
  }
  if (!ranking) return { kind: "unavailable" }

  if (isAmbiguous(ranking)) {
    const clarification = await askClarifyingQuestion(request, ranking, catalog)
    if (clarification) return clarification
  }

  const best = ranking.candidates[0] ?? { templateId: catalog[0]?.id ?? "", name: "", probability: 0 }
  return { kind: "match", templateId: best.templateId, confidence: best.probability, decidedBy: ranking.decidedBy, candidates: ranking.candidates }
}
