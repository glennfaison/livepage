/**
 * Server-only HTTP client for OpenAI's Chat Completions API, used to draft
 * headline/summary copy for a matched template (see copy-draft.ts).
 *
 * This module reads OPENAI_API_KEY from the server environment. Do not
 * import it from a "use client" file or re-export it from
 * features/prompt-assist/index.ts — reach it through
 * features/prompt-assist/server.ts instead, which route handlers import.
 */

import { consumeProviderBudget } from "./rate-limit"

export class CopyGenerationUnavailableError extends Error {}

// Drafting a few short fields is a small, low-stakes generation task, so a
// small low-cost model is the default. Override with OPENAI_MODEL.
const DEFAULT_MODEL = "gpt-5-nano"
const REQUEST_TIMEOUT_MS = 15000

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

  if (!consumeProviderBudget("openai")) {
    throw new CopyGenerationUnavailableError("OpenAI call budget for this minute is exhausted")
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
        // No `temperature`: the GPT-5 family rejects any value except the
        // default with a 400, and this must work for whatever model
        // OPENAI_MODEL points at.
        messages: [
          { role: "system", content: params.system },
          { role: "user", content: params.user },
        ],
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
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
