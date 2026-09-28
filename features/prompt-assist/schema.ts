import { z } from "zod"

/**
 * Shared, deeply readonly request/response contracts for prompt assist.
 * Zod infers mutable types, so each exported type is wrapped in
 * `DeepReadonly` to satisfy the "feature-facing types are deeply readonly"
 * guidance in docs/CONTEXT.md.
 */
type DeepReadonly<T> = T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T

export const MAX_PROMPT_LENGTH = 2000
const MAX_FIELD_LENGTH = 200
const MAX_SUMMARY_LENGTH = 600

const promptSchema = z.string().trim().min(1).max(MAX_PROMPT_LENGTH)

/**
 * The structured parameters extracted from a prompt-assist chat message.
 * See docs/GLOSSARY.md ("Page brief") for the canonical definition.
 */
export const pageBriefSchema = z.object({
  rawPrompt: z.string().max(MAX_PROMPT_LENGTH),
  toneHints: z.array(z.string().max(MAX_FIELD_LENGTH)).max(32),
  colorHints: z.array(z.string().max(MAX_FIELD_LENGTH)).max(32),
  name: z.string().max(MAX_FIELD_LENGTH).optional(),
  headline: z.string().max(MAX_FIELD_LENGTH).optional(),
})
export type PageBrief = DeepReadonly<z.infer<typeof pageBriefSchema>>

export const templateCandidateSchema = z.object({
  templateId: z.string(),
  name: z.string(),
  category: z.string(),
  score: z.number(),
})
export type TemplateCandidate = DeepReadonly<z.infer<typeof templateCandidateSchema>>

/**
 * How a Template match was reached:
 * - "deterministic": one template clearly won the keyword ranking
 * - "jev": Jev broke a tie between near-tied candidates
 * - "jev-unavailable": near-tied and Jev could not answer, so the top candidate is a best guess
 * - "fallback": nothing in the prompt overlapped any template; the match is arbitrary
 * - "user": the person picked this template themselves
 */
export const templateMatchSchema = z.object({
  templateId: z.string(),
  confidence: z.number().min(0).max(1),
  decidedBy: z.enum(["deterministic", "jev", "jev-unavailable", "fallback", "user"]),
})
export type TemplateMatch = DeepReadonly<z.infer<typeof templateMatchSchema>>

export const matchRequestSchema = z.object({ prompt: promptSchema })
export type MatchRequest = DeepReadonly<z.infer<typeof matchRequestSchema>>

export const matchResponseSchema = z.object({
  brief: pageBriefSchema,
  match: templateMatchSchema,
  candidates: z.array(templateCandidateSchema),
})
export type MatchResponse = DeepReadonly<z.infer<typeof matchResponseSchema>>

/**
 * Draft copy for the "name" / "headline" / "summary" slots that every
 * bundled template already exposes through its `dataMapping.fields`.
 * Length caps are enforced here because model output is untrusted and is
 * written straight into the page.
 */
export const promptDraftSchema = z.object({
  name: z.string().max(MAX_FIELD_LENGTH).optional(),
  headline: z.string().max(MAX_FIELD_LENGTH).optional(),
  summary: z.string().max(MAX_SUMMARY_LENGTH).optional(),
})
export type PromptDraft = DeepReadonly<z.infer<typeof promptDraftSchema>>

/**
 * The server re-derives the Page brief from `prompt`, so the client never
 * supplies (and the server never trusts) a pre-built brief.
 */
export const draftRequestSchema = z.object({
  prompt: promptSchema,
  templateId: z.string().min(1).max(MAX_FIELD_LENGTH),
})
export type DraftRequest = DeepReadonly<z.infer<typeof draftRequestSchema>>

export const draftResponseSchema = z.object({
  draft: promptDraftSchema,
  source: z.enum(["openai", "fallback"]),
})
export type DraftResponse = DeepReadonly<z.infer<typeof draftResponseSchema>>
