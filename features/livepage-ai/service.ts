import {
  livePageAIRequestSchema,
  livePageAIResponseSchema,
  type LivePageAIAction,
  type LivePageAIPlanStep,
  type LivePageAIProgressEvent,
  type LivePageAIRequest,
  type LivePageAIResponse,
} from "./contracts"
import { componentTagList } from "@/features/design-component-runtime/component-tags"

const TYPESAFE_ENDPOINT = "https://api.typesafe.ai/v1/systemone"
const MAX_STEPS = 8
const MAX_ACTIONS = 8
const componentTags = componentTagList

export class MissingTypesafeApiKeyError extends Error {
  constructor() {
    super("TYPESAFE_API_KEY is not configured")
    this.name = "MissingTypesafeApiKeyError"
  }
}

export class LivePageAIServiceError extends Error {
  constructor(message = "LivePageAI service failed") {
    super(message)
    this.name = "LivePageAIServiceError"
  }
}

type TypesafeAnswer = { type?: string; noul?: number; choice?: unknown }
type TypesafeResponse = { answers?: Record<string, TypesafeAnswer> }

function apiKey(): string {
  const key = process.env.TYPESAFE_API_KEY?.trim()
  if (!key) throw new MissingTypesafeApiKeyError()
  return key
}

async function evaluate(key: string, state: unknown, questions: Record<string, unknown>): Promise<TypesafeResponse> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  let response: Response
  try {
    response = await fetch(TYPESAFE_ENDPOINT, {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "jev-latest", state, questions }),
      signal: controller.signal,
    })
  } catch {
    throw new LivePageAIServiceError()
  } finally {
    clearTimeout(timeout)
  }
  if (!response.ok) throw new LivePageAIServiceError()
  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new LivePageAIServiceError()
  }
  if (!data || typeof data !== "object" || !("answers" in data)) throw new LivePageAIServiceError()
  return data as TypesafeResponse
}

function choice(answers: TypesafeResponse["answers"], name: string): string | undefined {
  const value = answers?.[name]?.choice
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function nodes(page: unknown): Array<{ id: string; tag: string; title?: string }> {
  const result: Array<{ id: string; tag: string; title?: string }> = []
  const visit = (value: unknown) => {
    if (!value || typeof value !== "object") return
    const node = value as { tag?: unknown; attributes?: unknown; children?: unknown }
    if (typeof node.tag === "string" && node.attributes && typeof node.attributes === "object") {
      const attributes = node.attributes as Record<string, unknown>
      if (typeof attributes.id === "string") result.push({ id: attributes.id, tag: node.tag, title: typeof attributes.title === "string" ? attributes.title : undefined })
    }
    if (Array.isArray(node.children)) node.children.forEach(visit)
  }
  if (Array.isArray(page)) page.forEach(visit)
  return result
}

function progressFor(action: LivePageAIAction, status: "in-progress" | "completed"): LivePageAIProgressEvent {
  const isClarification = action.type === "clarify"
  const componentTag = action.type === "add_component" ? action.tag : action.type === "create_page" ? "page" : "page"
  const targetLocation = action.type === "add_component" ? (action.parentId ? `component ${action.parentId}` : "page root") : action.type === "update_component" || action.type === "remove_component" ? `component ${action.componentId}` : "page root"
  return {
    type: "proposed_mutation",
    intent: action.reason,
    componentTag,
    componentLabel: componentTag === "page" ? "Page" : componentTag,
    targetLocation,
    ...(action.type === "add_component" && action.parentId ? { parentId: action.parentId } : {}),
    ...(action.type === "update_component" || action.type === "remove_component" ? { componentId: action.componentId } : {}),
    ...(action.type === "create_page" ? { content: action.title } : {}),
    ...(action.type === "add_component" && (action.content ?? action.text) ? { content: action.content ?? action.text } : {}),
    ...(action.type === "update_component" ? { value: action.value } : {}),
    status: isClarification ? "needs_clarification" : status,
    signal: isClarification ? "needs_clarification" : status === "completed" ? "completed" : "in_progress",
  } as LivePageAIProgressEvent
}

function scopeProgress(status: "completed" | "needs_clarification"): LivePageAIProgressEvent {
  return {
    type: "scope_evaluation",
    intent: "Evaluate whether the request is a supported page-building change.",
    componentTag: "page",
    componentLabel: "Page",
    targetLocation: "current page",
    status,
    signal: status === "completed" ? "completed" : "needs_clarification",
  }
}

// Each row is [tag, label, content, customClasses?]. `label` drives the short,
// human-readable reason/plan description; `content` is the actual copy rendered
// in the component, and `customClasses` applies the component's existing
// custom-classes attribute for basic spacing/typography (see CONTEXT.md's
// preference for using design-component settings over hard-coded fixes).
type SectionSpec = readonly [tag: string, label: string, content: string, customClasses?: string]

const PROSE_CLASSES = "max-w-2xl text-muted-foreground leading-relaxed"
const SECTION_HEADING_CLASSES = "mt-8"

function fallbackActions(prompt: string): LivePageAIAction[] {
  const normalized = prompt.toLowerCase()
  const sections: SectionSpec[] = normalized.includes("resume") || normalized.includes("cv")
    ? [
        ["header1", "Software Engineer Resume", "Software Engineer Resume"],
        ["paragraph", "Professional summary",
          "A results-driven software engineer with a track record of shipping reliable, well-tested products. Skilled at turning ambiguous requirements into clean, maintainable code and collaborating closely with cross-functional teams.",
          PROSE_CLASSES],
        ["header2", "Technical Skills", "Technical Skills", SECTION_HEADING_CLASSES],
        ["paragraph", "Technical skills and tools",
          "Proficient in JavaScript/TypeScript, React, and Node.js, with hands-on experience across databases, CI/CD pipelines, and cloud infrastructure.",
          PROSE_CLASSES],
        ["header2", "Work Experience", "Work Experience", SECTION_HEADING_CLASSES],
        ["paragraph", "Professional experience",
          "Delivered end-to-end features on fast-moving teams, from initial design through deployment and monitoring, consistently improving performance and developer experience along the way.",
          PROSE_CLASSES],
        ["header2", "Selected Projects", "Selected Projects", SECTION_HEADING_CLASSES],
      ]
    : normalized.includes("portfolio") || normalized.includes("site") || normalized.includes("website")
      ? [
          ["header1", "Welcome", "Welcome"],
          ["paragraph", "Introduction",
            "I'm a designer and developer who loves building thoughtful, functional experiences. Take a look at my work below, and feel free to reach out if you'd like to collaborate.",
            PROSE_CLASSES],
          ["header2", "Featured Work", "Featured Work", SECTION_HEADING_CLASSES],
          ["paragraph", "Featured work and services",
            "A selection of recent projects spanning product design, front-end development, and brand identity — each crafted with an eye for detail and a focus on real user needs.",
            PROSE_CLASSES],
          ["header2", "About", "About", SECTION_HEADING_CLASSES],
          ["paragraph", "About this business or creator",
            "I bring a blend of creative and technical skills to every project, with a passion for solving problems and building products people genuinely enjoy using.",
            PROSE_CLASSES],
          ["button", "Get in touch", "Get in touch", "mt-2"],
        ]
      : []

  return sections.slice(0, MAX_ACTIONS).map(([tag, label, content, customClasses]) => ({
    type: "add_component" as const,
    tag: tag as typeof componentTags[number],
    content,
    ...(customClasses ? { customClasses } : {}),
    reason: `Add the ${label.toLowerCase()} section to build the requested page.`,
  }))
}

function isBroadBuildIntent(prompt: string): boolean {
  const normalized = prompt.toLowerCase()
  return ["build", "create", "make", "design"].some((word) => normalized.includes(word)) &&
    ["resume", "cv", "portfolio", "website", "site", "page"].some((word) => normalized.includes(word))
}

function buildPlan(prompt: string, parentId?: string): LivePageAIPlanStep[] {
  return fallbackActions(prompt).map((action) => ({
    componentTag: action.type === "add_component" ? action.tag : "page",
    description: action.reason,
    targetLocation: parentId ? `component ${parentId}` : "page root",
  }))
}

// A lightweight structural node shape mirroring the request's validated
// AppNode tree; kept local so this module never imports the client-facing
// design-component registry (see the client/server boundary fix history).
type EvaluatedNode = Readonly<{
  tag: string
  attributes: Readonly<Record<string, string>>
  children: ReadonlyArray<EvaluatedNode | string>
}>

function findPageRootNode(currentPage: unknown, pageRootId?: string): EvaluatedNode | undefined {
  if (!Array.isArray(currentPage) || currentPage.length === 0) return undefined
  const candidates = currentPage as ReadonlyArray<EvaluatedNode>
  return candidates.find((node) => node.attributes.id === pageRootId) ?? candidates[0]
}

function topLevelComponents(currentPage: unknown, pageRootId?: string): EvaluatedNode[] {
  const root = findPageRootNode(currentPage, pageRootId)
  if (!root) return []
  return root.children.filter((child): child is EvaluatedNode => typeof child !== "string")
}

function textContent(component: EvaluatedNode): string {
  return component.children.filter((child): child is string => typeof child === "string").join(" ").trim()
}

/**
 * Audits the rendered page against the deterministic build plan. This is a
 * structural/DOM proxy for "does the page meet the user's need"; Jev judges
 * typed state rather than images, so there is no true screenshot analysis.
 */
function evaluatePage(prompt: string, currentPage: unknown, pageRootId?: string) {
  const rawActions = fallbackActions(prompt)
  const plan = buildPlan(prompt, pageRootId)
  const presentTags = topLevelComponents(currentPage, pageRootId).map((component) => component.tag)
  const consumedCounts = new Map<string, number>()
  const missingIndexes: number[] = []
  plan.forEach((step, index) => {
    const tag = step.componentTag
    const used = consumedCounts.get(tag) ?? 0
    const available = presentTags.filter((candidate) => candidate === tag).length
    if (used < available) consumedCounts.set(tag, used + 1)
    else missingIndexes.push(index)
  })
  return { plan, rawActions, missingIndexes, meetsRequirements: missingIndexes.length === 0 }
}

/** Finds a component the plan expects that was added but never given content. */
function findEmptyPlannedComponent(currentPage: unknown, pageRootId: string | undefined, plan: ReadonlyArray<LivePageAIPlanStep>): EvaluatedNode | undefined {
  const plannedTags = new Set<string>(plan.map((step) => step.componentTag))
  return topLevelComponents(currentPage, pageRootId).find(
    (component) => plannedTags.has(component.tag) && textContent(component) === "",
  )
}

/** Finds an exact duplicate (same tag and text) so it can be safely removed. */
function findDuplicateComponent(currentPage: unknown, pageRootId?: string): EvaluatedNode | undefined {
  const seen = new Set<string>()
  for (const component of topLevelComponents(currentPage, pageRootId)) {
    const text = textContent(component)
    if (!text) continue
    const key = `${component.tag}::${text}`
    if (seen.has(key)) return component
    seen.add(key)
  }
  return undefined
}

type NextStepDecision =
  | Readonly<{ kind: "act"; action: LivePageAIAction; currentStep: string; evaluation?: ReturnType<typeof evaluatePage> }>
  | Readonly<{ kind: "complete"; currentStep: string; evaluation: ReturnType<typeof evaluatePage> }>

type WorkflowState = NonNullable<LivePageAIRequest["workflow"]>

/**
 * Decides, for the current step, whether LivePageAI should add, update, or
 * remove a design component, or whether the page already meets the request.
 */
function decideNextStep(prompt: string, currentPage: unknown, workflow: WorkflowState, pageRoot?: string): NextStepDecision {
  const observation = workflow.observation
  const lastAction = workflow.lastAction as { type?: string; componentId?: string; field?: string } | undefined
  if (observation?.componentId && !observation.exists) {
    return {
      kind: "act",
      action: {
        type: "update_component",
        componentId: observation.componentId,
        field: "text",
        value: prompt.slice(0, 1_000),
        reason: "Repair the component after verification found that it was not rendered as expected.",
      },
      currentStep: "Repairing the last component after verification found an issue.",
    }
  }
  // Only attempt one geometry repair per component; retrying forever would
  // loop if the layout genuinely can't be fixed by a class change.
  const alreadyRepairedGeometry =
    lastAction?.type === "update_component" && lastAction.componentId === observation?.componentId && lastAction.field === "custom-classes"
  if (observation?.componentId && observation.exists && !observation.validGeometry && !alreadyRepairedGeometry) {
    return {
      kind: "act",
      action: {
        type: "update_component",
        componentId: observation.componentId,
        field: "custom-classes",
        value: "block w-full",
        reason: "Adjust sizing so the component renders visibly.",
      },
      currentStep: "Fixing the last component's sizing after verification found an issue.",
    }
  }

  const duplicate = findDuplicateComponent(currentPage, pageRoot)
  if (duplicate) {
    return {
      kind: "act",
      action: { type: "remove_component", componentId: duplicate.attributes.id, reason: "Remove a duplicate component created during an earlier step." },
      currentStep: "Removing a duplicate component so the page stays clean.",
    }
  }

  const evaluation = evaluatePage(prompt, currentPage, pageRoot)
  if (evaluation.missingIndexes.length > 0) {
    const index = evaluation.missingIndexes[0]
    const rawAction = evaluation.rawActions[index]
    const action: LivePageAIAction = rawAction.type === "add_component" && pageRoot ? { ...rawAction, parentId: pageRoot } : rawAction
    return {
      kind: "act",
      action,
      currentStep: action.type === "add_component" ? `Deciding to add a ${action.tag} for ${evaluation.plan[index].description.toLowerCase()}` : "Deciding on the next safe page change.",
      evaluation,
    }
  }

  const emptyComponent = findEmptyPlannedComponent(currentPage, pageRoot, evaluation.plan)
  if (emptyComponent) {
    const matchingRaw = evaluation.rawActions.find((action) => action.type === "add_component" && action.tag === emptyComponent.tag)
    const content = matchingRaw?.type === "add_component" ? matchingRaw.content ?? matchingRaw.text : undefined
    return {
      kind: "act",
      action: {
        type: "update_component",
        componentId: emptyComponent.attributes.id,
        field: "text",
        value: content ?? "Content pending.",
        reason: `Fill in the empty ${emptyComponent.tag} section.`,
      },
      currentStep: `Updating the ${emptyComponent.tag} section, which was left empty.`,
      evaluation,
    }
  }

  return { kind: "complete", currentStep: "Confirming the page meets your request.", evaluation }
}

async function planWorkflow(input: LivePageAIRequest): Promise<LivePageAIResponse> {
  const request = livePageAIRequestSchema.parse(input)
  const key = apiKey()
  const workflow = request.workflow ?? { phase: "start", confirmed: false, completedActionCount: 0 }
  const pageRoot = nodes(request.currentPage ?? []).find((node) => node.tag === "page")?.id

  // Scope is only ambiguous before a plan exists: once the user has confirmed a plan and
  // LivePageAI is executing it step by step, re-asking "is this a page-building request?"
  // on every mutation/verify turn is redundant (the plan already established scope) and
  // was surfacing as a confusing, repeated "evaluating scope" activity entry.
  if (workflow.phase === "start") {
    const scope = await evaluate(key, {
      request: request.prompt,
      transcript: request.transcript,
      currentPage: request.currentPage ?? [],
      workflow,
    }, {
      is_page_building: {
        type: "noul",
        instructions: "Is this request asking to build, edit, or improve a website or page?",
        criteria: { true: "A page-building request.", false: "Not a page-building request." },
      },
    })
    if (typeof scope.answers?.is_page_building?.noul !== "number" || scope.answers.is_page_building.noul < 0.7) {
      return livePageAIResponseSchema.parse({
        status: "out_of_scope",
        message: "I can help build or edit a page or website.",
        actions: [],
        progress: [scopeProgress("completed")],
        workflow: { phase: "scope" },
      })
    }
  }

  const understanding = `I understand that you want to build: ${request.prompt.trim().slice(0, 700)}`
  const plan = buildPlan(request.prompt, pageRoot)
  if (workflow.phase === "start" && plan.length === 0) {
    return livePageAIResponseSchema.parse({
      status: "needs_clarification",
      message: "Could you tell me a bit more about what you'd like the page to include? For example, is it a resume/CV or a portfolio/business site, and what sections matter most?",
      actions: [],
      progress: [scopeProgress("completed")],
      workflow: {
        phase: "clarifying",
        currentStep: "Asking a clarifying question before proposing a build plan.",
        question: "What kind of page is this, and which sections should it include?",
      },
    })
  }
  if (workflow.phase === "start") {
    return livePageAIResponseSchema.parse({
      status: "needs_clarification",
      message: "I’ve prepared a build plan. Please review the shared understanding and steps below.",
      actions: [],
      progress: [scopeProgress("completed")],
      workflow: {
        phase: "confirmation",
        understanding,
        requiresConfirmation: true,
        plan,
        nextStep: "Confirm this direction and I’ll build it one component at a time.",
        currentStep: "Sharing the plan and waiting for your confirmation.",
      },
    })
  }
  if (workflow.phase !== "start" && !workflow.confirmed) {
    return livePageAIResponseSchema.parse({
      status: "needs_clarification",
      message: "Before I change the page, please confirm this shared understanding.",
      actions: [],
      progress: [],
      workflow: { phase: "confirmation", understanding, requiresConfirmation: true, plan, currentStep: "Waiting for you to confirm the plan." },
    })
  }

  const decision = decideNextStep(request.prompt, request.currentPage, workflow, pageRoot)
  if (decision.kind === "complete") {
    return livePageAIResponseSchema.parse({
      status: "completed",
      message: "The page matches the requested build. The job is done.",
      actions: [],
      progress: [],
      workflow: {
        phase: "complete",
        currentStep: decision.currentStep,
        verification: { passed: true, message: "All planned components are present and filled in." },
        evaluation: { meetsRequirements: decision.evaluation.meetsRequirements, missing: [], issues: [] },
      },
    })
  }
  const { action } = decision
  return livePageAIResponseSchema.parse({
    status: "completed",
    message: `Next I’ll ${action.reason.toLowerCase()}`,
    actions: [action],
    progress: [progressFor(action, "completed")],
    workflow: {
      phase: "mutation",
      currentStep: decision.currentStep,
      nextStep: `Place ${action.type === "add_component" ? action.tag : "the component"} at ${action.type === "add_component" ? (action.parentId ? `component ${action.parentId}` : "the page root") : "the selected location"}.`,
      settingsSummary: "Use the component's registered defaults and verify its rendered geometry before continuing.",
      ...(decision.evaluation
        ? (() => {
            const evaluation = decision.evaluation!
            return {
              evaluation: {
                meetsRequirements: evaluation.meetsRequirements,
                missing: evaluation.missingIndexes.map((index) => evaluation.plan[index].componentTag),
                issues: [],
              },
            }
          })()
        : {}),
    },
  })
}

export async function planLivePageAI(input: LivePageAIRequest): Promise<LivePageAIResponse> {
  const request = livePageAIRequestSchema.parse(input)
  if (request.workflow) return planWorkflow(request)
  const key = apiKey()
  const pageNodes = nodes(request.currentPage ?? [])
  const progress: LivePageAIProgressEvent[] = []
  const actions: LivePageAIAction[] = []
  const seen = new Set<string>()
  let scope: TypesafeResponse

  scope = await evaluate(key, { request: request.prompt, transcript: request.transcript, currentPage: request.currentPage ?? [] }, {
    is_page_building: {
      type: "noul",
      instructions: "Is this request asking to build, edit, or improve a website or page?",
      criteria: { true: "A page-building request.", false: "Not a page-building request." },
    },
  })
  if (typeof scope.answers?.is_page_building?.noul !== "number" || scope.answers.is_page_building.noul < 0.7) {
    return livePageAIResponseSchema.parse({ status: "out_of_scope", message: "I can help build or edit a page or website.", actions: [], progress: [scopeProgress("completed")] })
  }
  progress.push(scopeProgress("completed"))

  for (let step = 0; step < MAX_STEPS && actions.length < MAX_ACTIONS; step += 1) {
    const locations = pageNodes.length ? pageNodes.map((node) => node.id) : ["page root"]
    const result = await evaluate(key, {
      request: request.prompt,
      transcript: request.transcript,
      currentPage: request.currentPage ?? [],
      completedActions: actions,
    }, {
      next_action: {
        type: "choice",
        instructions: "Choose the next safe, concrete action for the request. Choose complete only when no further action is needed.",
        criteria: {
          create_page: "Create a new page.",
          add_component: "Add one supported design component at a specific location.",
          update_component: "Update an existing component with a specific id.",
          remove_component: "Remove an existing component with a specific id.",
          clarify: "A necessary detail is missing or unsafe.",
          complete: "The request is complete.",
        },
      },
      component_tag: { type: "choice", instructions: "Choose the supported component tag for the next action.", criteria: Object.fromEntries(componentTags.map((tag) => [tag, `Use the ${tag} design component.`])) },
      target: { type: "choice", instructions: "Choose the exact target location or component id.", criteria: Object.fromEntries(locations.map((id) => [id, `Target ${id}.`])) },
      content: { type: "choice", instructions: "Choose the exact concise content to use, when the action needs content.", criteria: { [request.prompt.slice(0, 1_000)]: "The requested content, normalized only as needed." } },
    })
    // `action` was the name used by the first contract revision. Accepting it
    // here keeps already deployed Jev prompts/replays safe while the richer
    // orchestrator uses `next_action`.
    const next = choice(result.answers, "next_action") ?? choice(result.answers, "action")
    if (next === "complete") {
      if (actions.length === 0) {
        const fallback = fallbackActions(request.prompt)
        actions.push(...fallback)
        progress.push(...fallback.map((action) => progressFor(action, "in-progress")))
      }
      break
    }
    if (next === "clarify" || !next) {
      const fallback = fallbackActions(request.prompt)
      if (fallback.length > 0) {
        actions.push(...fallback)
        progress.push(...fallback.map((action) => progressFor(action, "in-progress")))
        break
      }
      const action: LivePageAIAction = { type: "clarify", question: "Which supported component and target location should I change?", reason: "The request did not identify a safe, concrete next action." }
      actions.push(action)
      progress.push(progressFor(action, "completed"))
      break
    }
    const tag = choice(result.answers, "component_tag")
    const target = choice(result.answers, "target")
    const requestedContent = choice(result.answers, "content")
    const content = requestedContent ?? request.prompt.slice(0, 1_000)
    let action: LivePageAIAction | undefined
    if (next === "create_page") action = { type: "create_page", title: requestedContent?.slice(0, 120) ?? "New Page", reason: "The request asks for a new page." }
    else if (next === "add_component" && tag && (componentTags as readonly string[]).includes(tag)) action = { type: "add_component", tag: tag as typeof componentTags[number], ...(target && target !== "page root" ? { parentId: target } : {}), content, reason: `Add a ${tag} at the requested location.` }
    else if (next === "update_component" && target && pageNodes.some((node) => node.id === target)) action = { type: "update_component", componentId: target, field: "text", value: content, reason: `Update component ${target} with the requested content.` }
    else if (next === "remove_component" && target && pageNodes.some((node) => node.id === target)) action = { type: "remove_component", componentId: target, reason: `Remove component ${target} as requested.` }
    if (!action) {
      const clarify: LivePageAIAction = { type: "clarify", question: "Which supported component and target location should I change?", reason: "The requested action lacked a valid supported target." }
      actions.push(clarify)
      progress.push(progressFor(clarify, "completed"))
      break
    }
    if (action.type === "remove_component" && isBroadBuildIntent(request.prompt)) {
      const fallback = fallbackActions(request.prompt)
      actions.splice(0, actions.length, ...fallback)
      progress.splice(1, progress.length - 1, ...fallback.map((item) => progressFor(item, "in-progress")))
      break
    }
    const signature = JSON.stringify(action)
    if (seen.has(signature)) break
    seen.add(signature)
    actions.push(action)
    progress.push(progressFor(action, step === MAX_STEPS - 1 || actions.length === MAX_ACTIONS ? "completed" : "in-progress"))
    // Creating a page is a complete operation; subsequent sections can be
    // requested explicitly after the new page exists.
    if (action.type === "create_page") break
  }

  const last = actions.at(-1)
  const status = last?.type === "clarify" ? "needs_clarification" : "completed"
  if (progress.length && status === "completed") {
    const mutation = progress.filter((event) => event.type === "proposed_mutation").at(-1)
    if (mutation && mutation.signal === "in_progress") progress[progress.length - 1] = { ...mutation, status: "completed", signal: "completed" }
  }
  return livePageAIResponseSchema.parse({
    status,
    message: status === "needs_clarification" ? "I need one specific component and target location before making a safe change." : `Prepared ${actions.length} bounded page action${actions.length === 1 ? "" : "s"}.`,
    actions,
    progress: progress.slice(0, 8),
  })
}
