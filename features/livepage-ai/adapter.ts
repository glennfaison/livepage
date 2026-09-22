import { z } from "zod"
import type { AppAction, AppState } from "@/features/types"
import { getComponentField } from "@/features/design-component-runtime/registry"
import { generateId } from "@/lib/utils"
import { livePageAIActionSchema, type LivePageAIAction } from "./contracts"

function hasComponent(components: AppState["componentTree"], id: string): boolean {
  return components.some((component) =>
    component.attributes.id === id ||
    component.children.some((child) => typeof child !== "string" && hasComponent([child], id)),
  )
}

function findComponent(components: AppState["componentTree"], id: string): AppState["componentTree"][number] | undefined {
  for (const component of components) {
    if (component.attributes.id === id) return component
    const nested = findComponent(
      component.children.filter((child): child is AppState["componentTree"][number] => typeof child !== "string"),
      id,
    )
    if (nested) return nested
  }
  return undefined
}

/** Maps the server's closed action vocabulary to ordinary reducer actions. */
export function createValidatedAiAction(
  input: unknown,
  state: AppState,
  expectedHistoryIndex = state.currentHistoryIndex,
): AppAction | null {
  const parsed = livePageAIActionSchema.safeParse(input)
  if (!parsed.success) return null
  const action = parsed.data as LivePageAIAction

  let reducerAction: AppAction
  switch (action.type) {
    case "add_component":
      if (action.parentId && !hasComponent(state.componentTree, action.parentId)) return null
      reducerAction = {
        type: "INSERT_COMPONENT",
        payload: {
          newComponentTag: action.tag,
          // Generated here (not inside the reducer) so the ID is deterministic across the
          // client's local simulation pass and the real dispatch — see the "duplicate reducer
          // invocation" bug in the diagnose skill history for why this matters.
          newComponentId: generateId(),
          parentId: action.parentId ?? state.activePage,
          ...((action.content ?? action.text) ? { initialChildren: [action.content ?? action.text!] } : {}),
          ...(action.customClasses ? { initialAttributes: { "custom-classes": action.customClasses } } : {}),
        },
      }
      break
    case "update_component":
      if (!hasComponent(state.componentTree, action.componentId)) return null
      {
        const component = findComponent(state.componentTree, action.componentId)
        const field = action.field === "text" || action.field === "title"
          ? undefined
          : component && getComponentField(component.tag, action.field)
        if (action.field !== "text" && action.field !== "title" && (!field || field.readOnly || field.disabled)) return null
      }
      reducerAction = {
        type: "UPDATE_COMPONENT",
        payload: {
          componentId: action.componentId,
          updates: action.field === "text" || action.field === "content"
            ? { children: [action.value] }
            : { attributes: { [action.field]: action.value } },
        },
      }
      break
    case "remove_component":
      if (action.componentId === state.activePage || !hasComponent(state.componentTree, action.componentId)) return null
      reducerAction = { type: "REMOVE_COMPONENT", payload: { componentId: action.componentId } }
      break
    case "create_page":
      reducerAction = {
        type: "ADD_PAGE",
        payload: { tag: "page", attributes: { id: `page-${Date.now()}`, title: action.title }, children: [] },
      }
      break
    case "clarify":
      return null
  }

  // The index is checked again by the reducer when an async response arrives.
  return { type: "APPLY_AI_ACTION", payload: { action: reducerAction, expectedHistoryIndex } }
}

export const isValidAiAction = (input: unknown): input is LivePageAIAction =>
  livePageAIActionSchema.safeParse(input).success
