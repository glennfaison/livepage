import { z } from "zod"

/**
 * The structured parameters extracted from a prompt-assist chat message.
 * See docs/GLOSSARY.md ("Page brief") for the canonical definition.
 */
export const pageBriefSchema = z.object({
  rawPrompt: z.string().min(1),
  toneHints: z.array(z.string()),
  colorHints: z.array(z.string()),
  name: z.string().optional(),
  headline: z.string().optional(),
})
export type PageBrief = z.infer<typeof pageBriefSchema>

export const templateCandidateSchema = z.object({
  templateId: z.string(),
  name: z.string(),
  category: z.string(),
  score: z.number(),
})
export type TemplateCandidate = z.infer<typeof templateCandidateSchema>

export const templateMatchSchema = z.object({
  templateId: z.string(),
  confidence: z.number().min(0).max(1),
  decidedBy: z.enum(["deterministic", "jev", "jev-unavailable"]),
})
export type TemplateMatch = z.infer<typeof templateMatchSchema>

export const matchRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
})
export type MatchRequest = z.infer<typeof matchRequestSchema>

export const matchResponseSchema = z.object({
  brief: pageBriefSchema,
  match: templateMatchSchema,
  candidates: z.array(templateCandidateSchema),
})
export type MatchResponse = z.infer<typeof matchResponseSchema>

/**
 * Draft copy for the "name" / "headline" / "summary" slots that every
 * bundled template already exposes through its `dataMapping.fields`.
 */
export const promptDraftSchema = z.object({
  name: z.string().optional(),
  headline: z.string().optional(),
  summary: z.string().optional(),
})
export type PromptDraft = z.infer<typeof promptDraftSchema>

export const draftRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  brief: pageBriefSchema,
  templateId: z.string().min(1),
})
export type DraftRequest = z.infer<typeof draftRequestSchema>

export const draftResponseSchema = z.object({
  draft: promptDraftSchema,
  source: z.enum(["openai", "fallback"]),
})
export type DraftResponse = z.infer<typeof draftResponseSchema>
