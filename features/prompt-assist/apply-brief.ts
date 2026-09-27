import type { AppAction, AppNode } from "@/features/app-state"
import { cloneTemplatePages, type PageTemplateDefinition } from "@/features/templates"

/**
 * Text values for the semantic field names every bundled template already
 * declares in its `dataMapping.fields` (see features/templates/schema.ts).
 * These names were introduced for the LinkedIn-profile import and are
 * provider-agnostic, so a prompt-assist brief/draft can reuse the same
 * `dataMapping.fields` targets without any change to the template schema
 * or the ten bundled definitions.
 */
export type PromptFieldValues = Readonly<{
  name?: string
  headline?: string
  summary?: string
}>

const PROMPT_FIELD_KEYS = ["name", "headline", "summary"] as const

function setNodeText(node: AppNode, componentId: string, text: string): AppNode {
  if (node.attributes.id === componentId) {
    return { ...node, children: [text] }
  }
  return {
    ...node,
    children: node.children.map((child) => (typeof child === "string" ? child : setNodeText(child, componentId, text))),
  }
}

/**
 * Walks `template.dataMapping.fields` for the field keys present in
 * `fieldValues` and writes each matching target's text content. Targets of
 * a kind other than "text" are skipped: every bundled template's
 * name/headline/summary mapping is a "text" target today, and a future
 * "attribute" target for one of these fields would need its own writer
 * before it could be filled from a prompt-assist brief.
 */
export function applyPromptFieldValues(
  pages: ReadonlyArray<AppNode>,
  template: PageTemplateDefinition,
  fieldValues: PromptFieldValues,
): ReadonlyArray<AppNode> {
  let nextPages = pages

  for (const fieldKey of PROMPT_FIELD_KEYS) {
    const value = fieldValues[fieldKey]
    if (!value) continue

    const mapping = template.dataMapping.fields.find((field) => field.source === fieldKey)
    if (!mapping) continue

    for (const target of mapping.targets) {
      if (target.kind !== "text") continue
      nextPages = nextPages.map((page) => setNodeText(page, target.componentId, value))
    }
  }

  return nextPages
}

/**
 * Builds the action batch for applying a template customized with prompt
 * field values, mirroring createApplyTemplateActions in
 * features/templates/registry.ts but folding the text customization into
 * the same SET_PAGES + single ADD_TO_HISTORY entry, so an "apply from chat"
 * click produces one history entry instead of one per customized field.
 */
export function createApplyPromptTemplateActions(
  template: PageTemplateDefinition,
  fieldValues: PromptFieldValues,
  historyLabel: string,
): ReadonlyArray<AppAction> {
  const clonedPages = cloneTemplatePages(template)
  const pages = applyPromptFieldValues(clonedPages, template, fieldValues)
  const activePageId = pages[0]?.attributes.id ?? ""

  return [
    { type: "SET_PAGES", payload: pages },
    { type: "SET_ACTIVE_PAGE", payload: activePageId },
    { type: "SET_SELECTED_COMPONENT", payload: "" },
    { type: "SET_SELECTED_COMPONENT_ANCESTORS", payload: "" },
    { type: "ADD_TO_HISTORY", payload: { action: historyLabel, pageState: pages } },
  ]
}
