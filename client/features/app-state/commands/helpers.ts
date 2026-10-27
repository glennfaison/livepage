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

export function cloneNodeWithNewIds(component: AppNode, idSuffix: string): AppNode {
  const newId = `${component.attributes.id}${idSuffix}`
  return {
    ...component,
    attributes: { ...component.attributes, id: newId },
    children: component.children.map((child) => (typeof child === "string" ? child : cloneNodeWithNewIds(child, idSuffix))),
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
 * Duplicates a page (root-level component with tag "page") and adds it to the component tree.
 * The duplicate gets a new unique ID and title.
 */
export function duplicatePage({
  components,
  pageId,
}: {
  components: ReadonlyArray<AppNode>
  pageId: string
}): AppNode[] {
  const pageIndex = components.findIndex(
    (p) => p.tag === "page" && p.attributes.id === pageId
  )
  if (pageIndex === -1) return components as unknown as AppNode[]

  const originalPage = components[pageIndex]
  const idSuffix = `-copy-${Date.now()}`
  const duplicatedPage = cloneNodeWithNewIds(originalPage, idSuffix)

  // Update the title to indicate it's a copy
  const originalTitle = originalPage.attributes.title ?? "Page"
  const duplicatedPageWithTitle: AppNode = {
    ...duplicatedPage,
    attributes: {
      ...duplicatedPage.attributes,
      title: `${originalTitle} (copy)`,
    },
  }

  return [
    ...components.slice(0, pageIndex + 1),
    duplicatedPageWithTitle,
    ...components.slice(pageIndex + 1),
  ]
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
  /** Insertion index among `newParentId`'s children as they are before the move (what a divider stands for). */
  index?: number
}>): AppNode[] {
  const componentToMove = findComponentById(components, componentId)
  if (!componentToMove) return components as unknown as AppNode[]

  const withoutComponent = removeComponent({ components, componentId })

  // Moving a component into itself or one of its descendants, or into a parent that does not
  // exist, would drop it from the tree along with its subtree. Leave the tree alone instead.
  if (!findComponentById(withoutComponent, newParentId)) return components as unknown as AppNode[]

  // Removing the component shifts every later sibling down by one, so an insertion index that
  // was counted before the move and lies after the component must shift with them.
  const oldParent = findComponentParent({ components, componentId })
  const oldIndex = oldParent?.attributes.id === newParentId
    ? oldParent.children.findIndex((child) => typeof child !== "string" && child.attributes.id === componentId)
    : -1
  const insertionIndex = typeof index === "number" && oldIndex !== -1 && oldIndex < index ? index - 1 : index

  return insertComponent({
    components: withoutComponent,
    newComponent: componentToMove,
    parentId: newParentId,
    index: insertionIndex,
  })
}

/**
 * Serializes a component tree node to a plain JSON-safe object for the clipboard.
 * Strips nothing; AppNode is already plain data.
 */
export function copyComponent(node: AppNode): AppNode {
  return JSON.parse(JSON.stringify(node)) as AppNode
}

/**
 * Clones a copied component with fresh IDs and inserts it into the tree.
 * Prefers inserting as a child of the selected component when the parent accepts the tag;
 * otherwise inserts as a sibling of the selected component.
 * Returns the new tree and whether the insert was as child or sibling (for toast messaging).
 */
export function pasteComponent({
  components,
  copied,
  selectedId,
  canAcceptChild,
}: {
  components: ReadonlyArray<AppNode | string>
  copied: AppNode
  selectedId: string
  canAcceptChild: (parentTag: string, childTag: string) => boolean
}): { tree: AppNode[]; insertedAs: "child" | "sibling" | "root" } {
  const idSuffix = `-paste-${Date.now()}`
  const newNode = cloneNodeWithNewIds(copied, idSuffix)

  // Find selected and its parent
  const selected = findComponentById(components, selectedId)
  if (!selected) {
    // No selection: insert at root of first page? or as sibling of root? Prefer append to active page if possible, but for simplicity append at top level if no parent.
    return {
      tree: insertComponent({ components, newComponent: newNode }) as AppNode[],
      insertedAs: "root",
    }
  }

  const parent = findComponentParent({ components, componentId: selectedId })
  const parentTag = parent?.tag
  const selectedTag = selected.tag

  // Prefer child of selected if selected accepts children of this tag
  if (canAcceptChild(selectedTag, newNode.tag)) {
    const newTree = insertComponent({
      components,
      newComponent: newNode,
      parentId: selectedId,
    })
    return { tree: newTree as AppNode[], insertedAs: "child" }
  }

  // Else sibling of selected (under same parent)
  if (parent) {
    const parentChildren = parent.children
    const idx = parentChildren.findIndex(
      (c) => typeof c !== "string" && c.attributes.id === selectedId
    )
    const insertIndex = idx === -1 ? parentChildren.length : idx + 1
    const newTree = insertComponent({
      components,
      newComponent: newNode,
      parentId: parent.attributes.id,
      index: insertIndex,
    })
    return { tree: newTree as AppNode[], insertedAs: "sibling" }
  }

  // Selected is root-level
  const rootIdx = (components as AppNode[]).findIndex(
    (c) => typeof c !== "string" && c.attributes.id === selectedId
  )
  const insertIndex = rootIdx === -1 ? components.length : rootIdx + 1
  const newTree = insertComponent({
    components,
    newComponent: newNode,
    index: insertIndex,
  })
  return { tree: newTree as AppNode[], insertedAs: "sibling" }
}
