import type { AppNode } from "@/client/features/types"

/**
 * Recursively searches for a component by its ID in a component tree.
 * Returns the component if found, or null if not found.
 */
export function findComponentById(
  components: ReadonlyArray<AppNode | string>,
  componentId: string,
): AppNode | null {
  for (const component of components) {
    if (typeof component === "string") continue
    if (component.attributes.id === componentId) return component

    const found = findComponentById(component.children, componentId)
    if (found) return found
  }
  return null
}
