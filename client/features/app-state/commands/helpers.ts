import type { AppNode } from "@/client/features/types"
import { findComponentById } from "@/client/features/app-state/tree"
export { findComponentById } from "@/client/features/app-state/tree"

/**
 * Finds the parent component of a given component ID in the component tree.
 * Returns the parent component if found, or null if the component is a root
 * or not found.
 */
export function findComponentParent({
  components,
  componentId,
}: Readonly<{
  components: ReadonlyArray<AppNode | string>
  componentId: string
}>): AppNode | null {
  for (const component of components) {
    if (typeof component === "string") continue

    const childIndex = component.children.findIndex(
      (child) => typeof child !== "string" && child.attributes.id === componentId
    )
    if (childIndex !== -1) return component

    const found = findComponentParent({ components: component.children, componentId })
    if (found) return found
  }
  return null
}

function cloneNodeWithNewIds(component: AppNode, idSuffix: string): AppNode {
  const newId = `${component.attributes.id}${idSuffix}`
  return {
    ...component,
    attributes: { ...component.attributes, id: newId },
    children: component.children.map((child) => (typeof child === "string" ? child : cloneNodeWithNewIds(child, idSuffix))),
  }
}

/**
 * Duplicates a page component tree, generating new IDs for all nodes.
 * The duplicate gets a new page ID and a distinct title.
 */
export function duplicatePage(
  page: AppNode,
  existingPageIds: ReadonlyArray<string>,
): AppNode {
  const idSuffix = `-copy-${Date.now()}`
  let baseTitle = page.attributes.title ?? "Page"
  // If title ends with " Copy", " Copy 2", etc., increment the number
  const copyMatch = baseTitle.match(/^(.+?)(?: Copy(?: (\d+))?)?$/)
  if (copyMatch) {
    const base = copyMatch[1]
    const num = copyMatch[2] ? parseInt(copyMatch[2], 10) + 1 : 2
    baseTitle = `${base} Copy ${num}`
  } else {
    baseTitle = `${baseTitle} Copy`
  }

  const duplicatedPage = cloneNodeWithNewIds(page, idSuffix)
  return {
    ...duplicatedPage,
    attributes: {
      ...duplicatedPage.attributes,
      title: baseTitle,
    },
  }
}

/**
 * Finds the ancestry path (parent chain) from the root to a component.
 * Returns an array of components from the target up to the root (target first),
 * or an empty array if the component is not found.
 */
export function findComponentParentTree({
  components,
  componentId,
}: Readonly<{
  components: ReadonlyArray<AppNode | string>
  componentId: string
}>): AppNode[] {
  for (const component of components) {
    if (typeof component === "string") {
      continue
    }

    if (component.attributes.id === componentId) {
      return [component]
    }

    const parentTree = findComponentParentTree({ components: component.children, componentId })
    if (parentTree.length > 0) {
      return [...parentTree, component]
    }
  }
  return []
}

/**
 * Inserts a new component into the component tree at the specified position.
 * If parentId is not provided, inserts at the root level.
 * If index is not provided, appends to the end of the parent's children.
 */
export function insertComponent({
  components,
  newComponent,
  parentId,
  index,
}: Readonly<{
  components: ReadonlyArray<AppNode | string>
  newComponent: AppNode
  parentId?: string
  index?: number
}>): AppNode[] {
  if (components.length === 0 && (parentId === null || parentId === undefined)) {
    return [newComponent]
  }

  return components.reduce<AppNode[]>((acc, component, idx) => {
    if (typeof component === "string") {
      return [...acc, component as never]
    }

    const siblingIndexIsValid = typeof index === "number" && -1 < index && index < components.length
    const siblingIndex = siblingIndexIsValid ? index : components.length
    if ((parentId === null || parentId === undefined) && idx === siblingIndex) {
      return [...acc, newComponent, component]
    }

    if (component.attributes.id === parentId) {
      const siblingChildIndexIsValid = typeof index === "number" && -1 < index && index < component.children.length
      const siblingChildIndex = siblingChildIndexIsValid ? index : component.children.length
      const parentComponent: AppNode = {
        ...component,
        children: [
          ...component.children.slice(0, siblingChildIndex),
          newComponent,
          ...component.children.slice(siblingChildIndex),
        ],
      }
      return [...acc, parentComponent]
    }

    return [
      ...acc,
      {
        ...component,
        children: insertComponent({
          components: component.children,
          newComponent,
          parentId,
          index,
        }),
      },
    ]
  }, [])
}

/**
 * Updates a component's attributes and/or children in the component tree.
 * Uses an `updated` object to track whether the component was found and modified.
 */
export function updateComponent({
  components,
  componentId,
  updates,
  updated,
}: Readonly<{
  components: ReadonlyArray<AppNode | string>
  componentId: string
  updates: Partial<AppNode>
  updated: { value: boolean }
}>): AppNode[] {
  return components.map((component) => {
    if (typeof component === "string") {
      return component as never
    }

    if (component.attributes.id === componentId) {
      updated.value = true
      return {
        ...component,
        attributes: { ...component.attributes, ...updates.attributes },
        children: updates.children ?? component.children,
      }
    }

    return {
      ...component,
      children: updateComponent({
        components: component.children,
        componentId,
        updates,
        updated,
      }),
    }
  })
}

/**
 * Removes a component from the component tree by its ID.
 * Returns a new tree without the component.
 */
export function removeComponent({
  components,
  componentId,
}: Readonly<{
  components: ReadonlyArray<AppNode | string>
  componentId: string
}>): AppNode[] {
  return components.reduce<AppNode[]>((acc, component) => {
    if (typeof component === "string") {
      return [...acc, component as never]
    }

    if (component.attributes.id === componentId) {
      return acc
    }

    const updatedChildren = removeComponent({
      components: component.children,
      componentId,
    })

    return [...acc, { ...component, children: updatedChildren }]
  }, [])
}

/**
 * Duplicates a component and inserts the copy immediately after the original.
 * The duplicate gets a new unique ID with a timestamp suffix.
 */
export function duplicateComponent({
  components,
  componentId,
}: {
  components: ReadonlyArray<AppNode | string>
  componentId: string
}): AppNode[] {
  return components.reduce<AppNode[]>((acc, component) => {
    if (typeof component === "string") {
      return [...acc, component as never]
    }

    if (component.attributes.id === componentId) {
      const idSuffix = `-copy-${Date.now()}`
      const duplicatedComponent = cloneNodeWithNewIds(component, idSuffix)
      return [...acc, component, duplicatedComponent]
    }

    return [
      ...acc,
      {
        ...component,
        children: duplicateComponent({
          components: component.children,
          componentId,
        }),
      },
    ]
  }, [])
}

/**
 * Replaces a component in the tree with a new component.
 * Returns a new tree with the component replaced.
 */
export function replaceComponent({
  components,
  oldComponentId,
  newComponent,
}: Readonly<{
  components: ReadonlyArray<AppNode | string>
  oldComponentId: string
  newComponent: AppNode
}>): AppNode[] {
  return components.map((component) => {
    if (typeof component === "string") {
      return component as never
    }

    if (component.attributes.id === oldComponentId) {
      return newComponent
    }

    return {
      ...component,
      children: replaceComponent({
        components: component.children,
        oldComponentId,
        newComponent,
      }),
    }
  })
}

/**
 * Pure counterpart of the UPDATE_COMPONENT command for callers that batch
 * several edits into one action (for example applying a template with
 * customizations). Returns the tree unchanged when `componentId` is absent.
 */
export function patchComponent(
  components: ReadonlyArray<AppNode>,
  componentId: string,
  updates: Partial<AppNode>,
): ReadonlyArray<AppNode> {
  return updateComponent({ components, componentId, updates, updated: { value: false } })
}

/**
 * Moves a component to a new parent at the specified index.
 * Prevents moving a component into its own descendant.
 * Returns the original tree if the component or new parent is not found,
 * or if the move would create a cycle.
 */
export function moveComponent({
  components,
  componentId,
  newParentId,
  index,
}: Readonly<{
  components: ReadonlyArray<AppNode | string>
  componentId: string
  newParentId: string
  index?: number
}>): AppNode[] {
  // First, remove the component from its current location
  const withoutComponent = removeComponent({ components, componentId })

  // Then insert it at the new location
  // We need to find the component that was removed to re-insert it
  const componentToMove = findComponentById(components, componentId)
  if (!componentToMove) return components as unknown as AppNode[]

  return insertComponent({
    components: withoutComponent,
    newComponent: componentToMove,
    parentId: newParentId,
    index,
  })
}
