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

export type JevChoiceAnswer = Readonly<{
  type: "choice"
  choice: string
  probabilities: Readonly<Record<string, number>>
  confidence: number
}>

export class JevUnavailableError extends Error {}

const DEFAULT_BASE_URL = "https://api.typesafe.ai"
const DEFAULT_MODEL = "jev-latest"

/**
 * Calls POST {baseUrl}/v1/systemone with a single named Choice question.
 * Throws JevUnavailableError (never a raw fetch/parse error) whenever the
 * key is missing, the network call fails, or the response doesn't look
 * like a Jev answer, so callers can fall back to the deterministic ranking
 * without special-casing every failure mode.
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

  const answer = (payload as { answers?: Record<string, unknown> } | null)?.answers?.[params.questionId]
  if (
    !answer ||
    typeof answer !== "object" ||
    (answer as { type?: unknown }).type !== "choice" ||
    typeof (answer as { choice?: unknown }).choice !== "string"
  ) {
    throw new JevUnavailableError("TypeSafe response did not include the expected choice answer")
  }

  return answer as JevChoiceAnswer
}
