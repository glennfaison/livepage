import "server-only"
import { z } from "zod"
import { createEnvRateLimiter } from "@/lib/rate-limit"

const DEFAULT_MODEL = "gpt-5-nano"
const REQUEST_TIMEOUT_MS = 20000

/** Raised for every failure mode (no key, budget spent, network, HTTP, bad or invalid body) so callers degrade uniformly. */
export class OpenAiUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "OpenAiUnavailableError"
  }
}

const budget = createEnvRateLimiter("OPENAI_CALLS_PER_MINUTE", 120)

export function isOpenAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY)
}

// OpenAI's strict structured outputs reject many validation keywords. The
// wire schema only describes shape; the full Zod schema still validates the reply.
const UNSUPPORTED_KEYWORDS = new Set(["minLength", "maxLength", "minimum", "maximum", "pattern", "format", "minItems", "maxItems", "$schema"])

function toWireSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(toWireSchema)
  if (typeof value !== "object" || value === null) return value
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !UNSUPPORTED_KEYWORDS.has(key))
      .map(([key, child]) => [key, toWireSchema(child)]),
  )
}

/**
 * Runs one chat completion constrained to `schema` (structured outputs) and
 * returns the reply parsed and validated by it. Model output is untrusted:
 * anything that fails the schema raises OpenAiUnavailableError.
 *
 * Object schemas must list every property as required (use `.nullable()`
 * for absent values). Reads OPENAI_API_KEY (required), OPENAI_MODEL and
 * OPENAI_CALLS_PER_MINUTE (outbound budget; 0 disables). Server only.
 */
export async function completeJson<T>(
  params: Readonly<{ system: string; user: string; schema: z.ZodType<T>; schemaName: string; model?: string }>,
): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new OpenAiUnavailableError("OPENAI_API_KEY is not configured")
  if (!budget.check("global").allowed) throw new OpenAiUnavailableError("OpenAI call budget for this minute is exhausted")

  let response: Response
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: params.model ?? process.env.OPENAI_MODEL ?? DEFAULT_MODEL,
        // No `temperature`: the GPT-5 family rejects any non-default value.
        response_format: {
          type: "json_schema",
          json_schema: { name: params.schemaName, strict: true, schema: toWireSchema(z.toJSONSchema(params.schema)) },
        },
        messages: [
          { role: "system", content: params.system },
          { role: "user", content: params.user },
        ],
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (cause) {
    throw new OpenAiUnavailableError(`Failed to reach OpenAI: ${(cause as Error).message}`)
  }
  if (!response.ok) throw new OpenAiUnavailableError(`OpenAI responded with ${response.status}`)

  const payload = (await response.json().catch(() => null)) as { choices?: Array<{ message?: { content?: unknown } }> } | null
  const content = payload?.choices?.[0]?.message?.content
  if (typeof content !== "string") throw new OpenAiUnavailableError("OpenAI response did not include message content")

  let json: unknown
  try {
    json = JSON.parse(content)
  } catch {
    throw new OpenAiUnavailableError("OpenAI returned non-JSON content")
  }
  const parsed = params.schema.safeParse(json)
  if (!parsed.success) throw new OpenAiUnavailableError(`OpenAI reply did not match the expected schema: ${parsed.error.message}`)
  return parsed.data
}
