import type { AppAction, AppNode } from "@/client/features/types"
import { cloneNodeWithNewIds } from "@/client/features/app-state/commands/helpers"
import type { ComponentTemplateDefinition } from "@/client/features/templates/component-schema"

/**
 * Creates the app actions that replace `componentId` with a deep clone of the
 * component template's root node. Every id inside the subtree is re-based so
 * the applied copy never collides with existing nodes. The reducer records a
 * single history entry and selects the new root once `REPLACE_COMPONENT` is
 * dispatched, so this is the only action needed.
 */
export function createApplyComponentTemplateActions(
  template: ComponentTemplateDefinition,
  options: Readonly<{
    componentId: string
    idSuffix?: string
  }>,
): ReadonlyArray<AppAction> {
  const clonedRoot = cloneNodeWithNewIds(template.content.root, options.idSuffix ?? `-copy`) as AppNode
  return [
    {
      type: "REPLACE_COMPONENT",
      payload: {
        oldComponentId: options.componentId,
        newComponent: clonedRoot,
      },
    },
  ]
}
