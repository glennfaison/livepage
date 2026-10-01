import "server-only"
import { z } from "zod"
import { createEnvRateLimiter } from "@/server/lib/rate-limit"

const DEFAULT_BASE_URL = "https://api.typesafe.ai"
const DEFAULT_MODEL = "jev-latest"
const REQUEST_TIMEOUT_MS = 8000

/** Raised for every failure mode (no key, budget spent, network, HTTP, bad body) so callers degrade uniformly. */
export class JevUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "JevUnavailableError"
  }
}

export type JevChoiceQuestion = Readonly<{
  type: "choice"
  instructions: string
  /** Option id -> what that option means. Include a no-match option when nothing may fit. */
  criteria: Readonly<Record<string, string>>
}>
export type JevNoulQuestion = Readonly<{ type: "noul"; instructions: string }>
export type JevQuestion = JevChoiceQuestion | JevNoulQuestion

const choiceAnswerSchema = z.object({
  type: z.literal("choice"),
  choice: z.string(),
  probabilities: z.record(z.string(), z.number()).catch({}),
  confidence: z.number().catch(0),
})
// Noul answers carry a yes-probability and, per the TypeSafe API, no confidence.
const noulAnswerSchema = z.object({ type: z.literal("noul"), noul: z.number() })

export type JevChoiceAnswer = Readonly<z.infer<typeof choiceAnswerSchema>>
export type JevNoulAnswer = Readonly<z.infer<typeof noulAnswerSchema>>
export type JevAnswerFor<Q extends JevQuestion> = Q extends JevChoiceQuestion ? JevChoiceAnswer : JevNoulAnswer
export type JevAnswers<Qs extends Readonly<Record<string, JevQuestion>>> = { readonly [K in keyof Qs]: JevAnswerFor<Qs[K]> }

const responseSchema = z.object({ answers: z.record(z.string(), z.unknown()) })

const budget = createEnvRateLimiter("TYPESAFE_CALLS_PER_MINUTE", 120)

export function isJevConfigured(): boolean {
  return Boolean(process.env.TYPESAFE_API_KEY)
}

/**
 * Asks Jev (TypeSafe System One) independent typed questions about one
 * state, in a single request. Answers are typed per question kind and
 * validated; anything unexpected raises JevUnavailableError.
 *
 * Reads TYPESAFE_API_KEY (required), TYPESAFE_BASE_URL, TYPESAFE_MODEL and
 * TYPESAFE_CALLS_PER_MINUTE (outbound budget; 0 disables). Server only.
 */
export async function askJev<const Qs extends Readonly<Record<string, JevQuestion>>>(
  params: Readonly<{ state: unknown; questions: Qs }>,
): Promise<JevAnswers<Qs>> {
  const apiKey = process.env.TYPESAFE_API_KEY
  if (!apiKey) throw new JevUnavailableError("TYPESAFE_API_KEY is not configured")
  if (!budget.check("global").allowed) throw new JevUnavailableError("Jev call budget for this minute is exhausted")

  const baseUrl = process.env.TYPESAFE_BASE_URL ?? DEFAULT_BASE_URL
  let response: Response
  try {
    response = await fetch(`${baseUrl}/v1/systemone`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.TYPESAFE_MODEL ?? DEFAULT_MODEL,
        state: params.state,
        questions: params.questions,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (cause) {
    throw new JevUnavailableError(`Failed to reach TypeSafe: ${(cause as Error).message}`)
  }
  if (!response.ok) throw new JevUnavailableError(`TypeSafe responded with ${response.status}`)

  const payload = await response.json().catch(() => null)
  const parsed = responseSchema.safeParse(payload)
  if (!parsed.success) throw new JevUnavailableError("TypeSafe response did not include answers")

  const answers: Record<string, unknown> = {}
  for (const [id, question] of Object.entries(params.questions)) {
    const schema = question.type === "choice" ? choiceAnswerSchema : noulAnswerSchema
    const answer = schema.safeParse(parsed.data.answers[id])
    if (!answer.success) throw new JevUnavailableError(`TypeSafe answer for "${id}" was not a ${question.type} answer`)
    answers[id] = answer.data
  }
  return answers as JevAnswers<Qs>
}
