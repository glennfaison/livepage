import { z } from "zod"
import { componentTagList } from "@/features/design-component-runtime/component-tags"

const componentTags = componentTagList

const appNodeSchema: z.ZodType = z.lazy(() =>
  z.object({
    tag: z.union([z.literal("page"), z.enum(componentTags)]),
    attributes: z.record(z.string(), z.string()),
    children: z.array(z.union([z.string(), appNodeSchema])),
  }),
)

export const LIVE_PAGE_AI_MAX_TRANSCRIPT_MESSAGES = 20
export const LIVE_PAGE_AI_MAX_PROGRESS_EVENTS = 8
const componentIdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,80}$/)

const livePageAIMessageSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(4_000),
  })
  .strict()

export type LivePageAIMessage = z.infer<typeof livePageAIMessageSchema>

export const livePageAIRequestSchema = z
  .object({
    sessionId: z.string().uuid(),
    prompt: z.string().trim().min(1).max(4_000),
    currentPage: z.array(appNodeSchema).optional(),
    transcript: z.array(livePageAIMessageSchema).max(LIVE_PAGE_AI_MAX_TRANSCRIPT_MESSAGES).default([]),
    historyIndex: z.number().int(),
    workflow: z.object({
      phase: z.enum(["start", "understanding", "next", "verify", "complete"]),
      confirmed: z.boolean().default(false),
      completedActionCount: z.number().int().min(0).max(20).default(0),
      lastAction: z.unknown().optional(),
      guidance: z.string().trim().min(1).max(2_000).optional(),
      observation: z.object({
        componentId: componentIdSchema.optional(),
        exists: z.boolean(),
        parentId: componentIdSchema.optional(),
        rendered: z.boolean(),
        validGeometry: z.boolean(),
        issues: z.array(z.string().max(200)).max(8).default([]),
      }).optional(),
    }).optional(),
  })
  .strict()

const actionBase = z.object({ reason: z.string().trim().min(1).max(500) }).strict()

export const livePageAIActionSchema = z.discriminatedUnion("type", [
  actionBase.extend({
    type: z.literal("create_page"),
    title: z.string().trim().min(1).max(120),
  }),
  actionBase.extend({
    type: z.literal("add_component"),
    tag: z.enum(componentTags),
    // parentId is optional for compatibility with the active-page default, but
    // is emitted by the normalized protocol whenever a parent is known.
    parentId: componentIdSchema.optional(),
    content: z.string().trim().max(1_000).optional(),
    text: z.string().trim().max(1_000).optional(),
    // Applied via the component's existing "custom-classes" attribute (see
    // component-helpers.readCustomClasses) so the deterministic build plan can
    // give sections sensible default spacing/typography without hard-coding
    // visual fixes into a specific template.
    customClasses: z.string().trim().max(300).optional(),
  }),
  actionBase.extend({
    type: z.literal("update_component"),
    componentId: componentIdSchema,
    field: z.string().trim().min(1).max(80),
    value: z.string().trim().max(1_000),
  }),
  actionBase.extend({
    type: z.literal("remove_component"),
    componentId: componentIdSchema,
  }),
  actionBase.extend({
    type: z.literal("clarify"),
    question: z.string().trim().min(1).max(500),
  }),
])

export const livePageAIProgressEventSchema = z
  .object({
    type: z.enum(["scope_evaluation", "proposed_mutation"]),
    intent: z.string().trim().min(1).max(300),
    componentTag: z.union([z.literal("page"), z.enum(componentTags)]),
    componentLabel: z.string().trim().min(1).max(120),
    targetLocation: z.string().trim().min(1).max(200),
    parentId: componentIdSchema.optional(),
    componentId: componentIdSchema.optional(),
    content: z.string().trim().max(1_000).optional(),
    value: z.string().trim().max(1_000).optional(),
    status: z.enum(["planning", "in-progress", "completed", "needs_clarification"]),
    signal: z.enum(["in_progress", "completed", "needs_clarification"]),
  })
  .strict()
  .superRefine((event, context) => {
    if (
      event.type === "proposed_mutation" &&
      event.signal !== "needs_clarification" &&
      !event.parentId &&
      !event.componentId &&
      event.targetLocation !== "page root"
    ) {
      context.addIssue({
        code: "custom",
        path: ["parentId"],
        message: "A proposed mutation must identify its parent or component target.",
      })
    }
    if (
      event.type === "proposed_mutation" &&
      event.signal !== "needs_clarification" &&
      event.componentTag !== "page" &&
      !event.content &&
      !event.value &&
      !event.componentId
    ) {
      context.addIssue({
        code: "custom",
        path: ["content"],
        message: "A proposed mutation must include content or value.",
      })
    }
    if (event.signal === "completed" && event.status !== "completed") {
      context.addIssue({ code: "custom", path: ["status"], message: "Completed signals require completed status." })
    }
    if (event.signal === "needs_clarification" && event.status !== "needs_clarification") {
      context.addIssue({ code: "custom", path: ["status"], message: "Clarification signals require needs_clarification status." })
    }
  })

export type LivePageAIProgressEvent = z.infer<typeof livePageAIProgressEventSchema>

const MAX_PLAN_STEPS = 10

const livePageAIPlanStepSchema = z
  .object({
    componentTag: z.union([z.literal("page"), z.enum(componentTags)]),
    description: z.string().trim().min(1).max(200),
    targetLocation: z.string().trim().min(1).max(200),
  })
  .strict()

export const livePageAIResponseSchema = z
  .object({
    status: z.enum(["completed", "needs_clarification", "out_of_scope"]),
    message: z.string().trim().min(1).max(1_000),
    actions: z.array(livePageAIActionSchema).max(8),
    progress: z.array(livePageAIProgressEventSchema).max(LIVE_PAGE_AI_MAX_PROGRESS_EVENTS).default([]),
    workflow: z.object({
      phase: z.enum(["scope", "understanding", "confirmation", "clarifying", "mutation", "verification", "complete"]),
      understanding: z.string().max(1_000).optional(),
      requiresConfirmation: z.boolean().optional(),
      plan: z.array(livePageAIPlanStepSchema).max(MAX_PLAN_STEPS).optional(),
      nextStep: z.string().max(500).optional(),
      settingsSummary: z.string().max(500).optional(),
      // A tiny, always-current status label the chat can show in muted text so
      // the user never mistakes an in-progress step for a stalled request.
      currentStep: z.string().trim().min(1).max(200).optional(),
      // Populated when the request is too ambiguous to plan concretely.
      question: z.string().trim().min(1).max(500).optional(),
      // The result of auditing the rendered page against the build plan; this
      // is a structural/DOM proxy for "does the page look right" rather than
      // true visual analysis, since Jev judges typed state, not images.
      evaluation: z.object({
        meetsRequirements: z.boolean(),
        missing: z.array(z.string().max(120)).max(10).default([]),
        issues: z.array(z.string().max(200)).max(10).default([]),
      }).optional(),
      verification: z.object({
        passed: z.boolean(),
        message: z.string().max(500),
      }).optional(),
    }).optional(),
  })
  .strict()

// The request accepts no transcript for a new ephemeral chat; parsing supplies
// an empty transcript before the service constructs Jev state.
export type LivePageAIRequest = z.input<typeof livePageAIRequestSchema>
export type LivePageAIAction = z.infer<typeof livePageAIActionSchema>
export type LivePageAIResponse = z.infer<typeof livePageAIResponseSchema>
export type LivePageAIPlanStep = z.infer<typeof livePageAIPlanStepSchema>
