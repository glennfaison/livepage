import { z } from "zod"

/**
 * Deeply readonly request/response contracts for prompt assist. Zod infers
 * mutable types, so each exported type is wrapped in `DeepReadonly`, per the
 * "feature-facing types are deeply readonly" rule in docs/CONTEXT.md.
 */
type DeepReadonly<T> = T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T

const MAX_PROMPT_LENGTH = 2000
export const MAX_CLARIFICATIONS = 2
const MAX_ANSWER_LENGTH = 500
export const MAX_DESCRIBED_NODES = 150
const MAX_DESCRIPTION_JSON_LENGTH = 200_000

const promptSchema = z.string().trim().min(1).max(MAX_PROMPT_LENGTH)

/** One question the assistant asked and the person's reply; together with the prompt they form the request. */
const clarificationSchema = z.object({
  question: z.string().trim().min(1).max(MAX_ANSWER_LENGTH),
  answer: z.string().trim().min(1).max(MAX_ANSWER_LENGTH),
})
export type Clarification = DeepReadonly<z.infer<typeof clarificationSchema>>

/** The person's description of the page, plus any clarifying answers so far. */
const pageRequestShape = {
  prompt: promptSchema,
  clarifications: z.array(clarificationSchema).max(MAX_CLARIFICATIONS).default([]),
}
export type PageRequest = DeepReadonly<{ prompt: string; clarifications: ReadonlyArray<Clarification> }>

const templateCandidateSchema = z.object({
  templateId: z.string(),
  name: z.string(),
  probability: z.number().min(0).max(1),
})
export type TemplateCandidate = DeepReadonly<z.infer<typeof templateCandidateSchema>>

export const matchRequestSchema = z.object(pageRequestShape)

/**
 * - "match": a template was chosen (`decidedBy` names the provider that judged it)
 * - "clarify": the request is too ambiguous; ask the person one question first
 * - "unavailable": no model provider is configured, so the person must pick a template
 */
export const matchResponseSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("match"),
    templateId: z.string(),
    confidence: z.number().min(0).max(1),
    decidedBy: z.enum(["jev", "openai"]),
    candidates: z.array(templateCandidateSchema),
  }),
  z.object({
    kind: z.literal("clarify"),
    question: z.string().min(1).max(MAX_ANSWER_LENGTH),
    options: z.array(z.string().min(1).max(80)).max(4),
  }),
  z.object({ kind: z.literal("unavailable") }),
])
export type MatchResponse = DeepReadonly<z.infer<typeof matchResponseSchema>>

export const draftRequestSchema = z.object({ ...pageRequestShape, templateId: z.string().min(1).max(200) })

/** `values` is keyed by the template's `dataMapping.fields[].source`. Empty when no model is configured. */
export const draftResponseSchema = z.object({
  values: z.record(z.string(), z.string()),
  source: z.enum(["openai", "none"]),
})
export type DraftResponse = DeepReadonly<z.infer<typeof draftResponseSchema>>

/** A proposed change to one plain-attribute design-component setting. */
export const designEditSchema = z.object({
  componentId: z.string().min(1).max(200),
  setting: z.string().min(1).max(100),
  value: z.string().max(300),
  reason: z.string().max(200),
})
export type DesignEdit = DeepReadonly<z.infer<typeof designEditSchema>>

/** A design setting of a component tag, as a caller may read and write it. Mirrors the registry's field metadata. */
const settingDescriptorSchema = z.object({
  id: z.string().min(1).max(100),
  label: z.string().max(100),
  type: z.string().max(30),
  options: z.array(z.string().max(100)).max(50).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
})
export type SettingDescriptor = DeepReadonly<z.infer<typeof settingDescriptorSchema>>

const nodeSnapshotSchema = z.object({
  id: z.string().max(200),
  tag: z.string().min(1).max(50),
  text: z.string().max(100).optional(),
  settings: z.record(z.string(), z.string().max(300)),
})

/**
 * What the design loop needs to know about a page: its components with current
 * setting values, and which settings each tag exposes. It is derived in the
 * browser from the component registry (see page-description.ts), so the server
 * never loads React components or the registry.
 */
const pageDescriptionSchema = z
  .object({
    nodes: z.array(nodeSnapshotSchema).max(MAX_DESCRIBED_NODES),
    settings: z.record(z.string(), z.array(settingDescriptorSchema).max(60)),
  })
  .refine((page) => JSON.stringify(page).length <= MAX_DESCRIPTION_JSON_LENGTH, "Page description is too large")
export type PageDescription = DeepReadonly<z.infer<typeof pageDescriptionSchema>>

export const refineRequestSchema = z.object({ ...pageRequestShape, page: pageDescriptionSchema })

/** One refinement step: how well the page fits the request now, and the next bounded batch of edits. */
export const refineResponseSchema = z.object({
  /** Jev's probability that the page satisfies the request, or null when Jev did not judge. */
  satisfaction: z.number().min(0).max(1).nullable(),
  done: z.boolean(),
  edits: z.array(designEditSchema).max(12),
})
export type RefineResponse = DeepReadonly<z.infer<typeof refineResponseSchema>>
