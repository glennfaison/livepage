import { z } from "zod"

/**
 * Server-only HTTP client for TypeSafe's System One API ("Jev"), used to
 * disambiguate a template match when the deterministic ranking in
 * select-template.ts can't confidently pick one (see jev-decision.ts).
 *
 * This module reads TYPESAFE_API_KEY from the server environment. Do not
 * import it from a "use client" file or re-export it from
 * features/prompt-assist/index.ts — reach it through
 * features/prompt-assist/server.ts instead, which route handlers import.
 */

export type JevChoiceQuestion = Readonly<{
  type: "choice"
  instructions?: string
  criteria: Readonly<Record<string, string | null>>
}>

const jevChoiceAnswerSchema = z.object({
  type: z.literal("choice"),
  choice: z.string(),
  // Validated but tolerant: a malformed number must not fail the whole
  // request, so anything outside [0, 1] is clamped and a non-number
  // becomes 0 rather than throwing downstream in matchResponseSchema.
  confidence: z
    .number()
    .catch(0)
    .transform((value) => Math.min(1, Math.max(0, value))),
})
export type JevChoiceAnswer = Readonly<z.infer<typeof jevChoiceAnswerSchema>>

const jevResponseSchema = z.object({ answers: z.record(z.string(), z.unknown()) })

export class JevUnavailableError extends Error {}

const DEFAULT_BASE_URL = "https://api.typesafe.ai"
const DEFAULT_MODEL = "jev-latest"
const REQUEST_TIMEOUT_MS = 8000

/**
 * Calls POST {baseUrl}/v1/systemone with a single named Choice question.
 * Throws JevUnavailableError (never a raw fetch/parse error) whenever the
 * key is missing, the network call fails or times out, or the response
 * doesn't look like a Jev answer, so callers can fall back to the
 * deterministic ranking without special-casing every failure mode.
 */
export async function callJevChoice(params: Readonly<{
  questionId: string
  question: JevChoiceQuestion
  state: unknown
}>): Promise<JevChoiceAnswer> {
  const apiKey = process.env.TYPESAFE_API_KEY
  if (!apiKey) {
    throw new JevUnavailableError("TYPESAFE_API_KEY is not configured")
  }

  const baseUrl = process.env.TYPESAFE_BASE_URL ?? DEFAULT_BASE_URL
  const model = process.env.TYPESAFE_MODEL ?? DEFAULT_MODEL

  let response: Response
  try {
    response = await fetch(`${baseUrl}/v1/systemone`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        state: params.state,
        questions: { [params.questionId]: params.question },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (cause) {
    throw new JevUnavailableError(`Failed to reach TypeSafe: ${(cause as Error).message}`)
  }

  if (!response.ok) {
    throw new JevUnavailableError(`TypeSafe responded with ${response.status}`)
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch (cause) {
    throw new JevUnavailableError(`TypeSafe response was not JSON: ${(cause as Error).message}`)
  }

  const parsedResponse = jevResponseSchema.safeParse(payload)
  const parsedAnswer = parsedResponse.success
    ? jevChoiceAnswerSchema.safeParse(parsedResponse.data.answers[params.questionId])
    : null
  if (!parsedAnswer?.success) {
    throw new JevUnavailableError("TypeSafe response did not include the expected choice answer")
  }

  return parsedAnswer.data
}
