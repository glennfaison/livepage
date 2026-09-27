/**
 * Server-only HTTP client for OpenAI's Chat Completions API, used to draft
 * headline/summary copy for a matched template (see copy-draft.ts).
 *
 * This module reads OPENAI_API_KEY from the server environment. Do not
 * import it from a "use client" file or re-export it from
 * features/prompt-assist/index.ts — reach it through
 * features/prompt-assist/server.ts instead, which route handlers import.
 */

export class CopyGenerationUnavailableError extends Error {}

// The cheapest OpenAI model as of September 2026: $0.05/M input tokens and
// $0.40/M output tokens, undercutting the older GPT-4.1 nano. Body copy for
// a page brief is a small, low-stakes generation task, so cost beats
// capability here. Override with OPENAI_MODEL if that changes.
const DEFAULT_MODEL = "gpt-5-nano"

/**
 * Sends a system/user message pair with response_format: json_object and
 * returns the parsed JSON body. Throws CopyGenerationUnavailableError
 * (never a raw fetch/parse error) for every failure mode, so callers can
 * fall back to brief-derived copy uniformly.
 */
export async function callOpenAiJson(params: Readonly<{ system: string; user: string }>): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new CopyGenerationUnavailableError("OPENAI_API_KEY is not configured")
  }

  const model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL

  let response: Response
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        temperature: 0.7,
        messages: [
          { role: "system", content: params.system },
          { role: "user", content: params.user },
        ],
      }),
    })
  } catch (cause) {
    throw new CopyGenerationUnavailableError(`Failed to reach OpenAI: ${(cause as Error).message}`)
  }

  if (!response.ok) {
    throw new CopyGenerationUnavailableError(`OpenAI responded with ${response.status}`)
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch (cause) {
    throw new CopyGenerationUnavailableError(`OpenAI response was not JSON: ${(cause as Error).message}`)
  }

  const content = (payload as { choices?: Array<{ message?: { content?: unknown } }> } | null)?.choices?.[0]?.message
    ?.content
  if (typeof content !== "string") {
    throw new CopyGenerationUnavailableError("OpenAI response did not include message content")
  }

  try {
    return JSON.parse(content)
  } catch (cause) {
    throw new CopyGenerationUnavailableError(`OpenAI returned non-JSON content: ${(cause as Error).message}`)
  }
}
