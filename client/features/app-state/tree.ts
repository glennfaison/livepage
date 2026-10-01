import type { AppNode } from "@/client/features/types"

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
