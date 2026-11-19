import type { AppAction, AppNode } from "@/client/features/types"
import { cloneNodeWithNewIds } from "@/client/features/app-state/commands/helpers"
import type { ComponentTemplateDefinition } from "@/client/features/templates/component-schema"
import { getComponentsAllowedIn } from "@/client/features/design-components/registry-store"

/**
 * Creates the app actions that replace `componentId` with a deep clone of the
 * component template's root node. Every id inside the subtree is re-based so
 * the applied copy never collides with existing nodes. The reducer records a
 * single history entry and selects the new root once `REPLACE_COMPONENT` is
 * dispatched, so this is the only action needed.
 *
 * Returns an empty array (no state change) when `parentTag` is supplied and the
 * template root is not allowed in that parent slot. The reducer itself refuses
 * when the target component is missing.
 */
export function createApplyComponentTemplateActions(
  template: ComponentTemplateDefinition,
  options: Readonly<{
    componentId: string
    idSuffix?: string
    parentTag?: string
  }>,
): ReadonlyArray<AppAction> {
  if (options.parentTag !== undefined) {
    const allowed = getComponentsAllowedIn(options.parentTag)
    const allowedTags = new Set(allowed.map((metadata) => metadata.tag))
    if (!allowedTags.has(template.content.root.tag)) {
      return []
    }
  }

  const clonedRoot = cloneNodeWithNewIds(template.content.root, options.idSuffix ?? \`-copy\`) as AppNode
  const historyDescription = \`Replaced \${options.componentId} with component template: \${template.metadata.name}\`
  return [
    {
      type: "REPLACE_COMPONENT",
      payload: {
        oldComponentId: options.componentId,
        newComponent: clonedRoot,
        historyDescription,
      },
    },
  ]
}
