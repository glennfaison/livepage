import { createDesignComponentInstance } from "@/features/design-components"
import type { DesignComponentTag } from "@/features/design-components/types"
import type { AppNode } from "../types"

function cloneNodeWithNewIds(component: AppNode, idSuffix: string): AppNode {
  const newId = `${component.attributes.id}${idSuffix}`
  return {
    ...component,
    attributes: { ...component.attributes, id: newId },
    children: component.children.map((child) => (typeof child === "string" ? child : cloneNodeWithNewIds(child, idSuffix))),
  }
}

type FindParentTreeProps = {
  components: ReadonlyArray<AppNode | string>
  componentId: string
}

export function findComponentParentTree({
  components,
  componentId,
}: FindParentTreeProps): AppNode[] {
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

export function findComponentById(
  components: ReadonlyArray<AppNode | string>,
  componentId: string,
): AppNode | null {
  for (const component of components) {
    if (typeof component === "string") {
      continue
    }

    if (component.attributes.id === componentId) {
      return component
    }

    const found = findComponentById(component.children, componentId)
    if (found) {
      return found
    }
  }

  return null
}

type InsertComponentProps = {
  components: ReadonlyArray<AppNode | string>
  newComponent: AppNode
  parentId?: string
  index?: number
}

export function insertComponent({
  components,
  newComponent,
  parentId,
  index,
}: InsertComponentProps): AppNode[] {
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

type UpdateComponentProps = {
  components: ReadonlyArray<AppNode | string>
  componentId: string
  updates: Partial<AppNode>
  updated: { value: boolean }
}

export function updateComponent({
  components,
  componentId,
  updates,
  updated,
}: UpdateComponentProps): AppNode[] {
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

type RemoveComponentProps = {
  components: ReadonlyArray<AppNode | string>
  componentId: string
}

export function removeComponent({
  components,
  componentId,
}: RemoveComponentProps): AppNode[] {
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

type ReplaceComponentProps = {
  components: ReadonlyArray<AppNode | string>
  oldComponentId: string
  newComponent: AppNode
}

export function replaceComponent({
  components,
  oldComponentId,
  newComponent,
}: ReplaceComponentProps): AppNode[] {
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

export function createNewComponent(tag: DesignComponentTag, id: string): AppNode {
  return createDesignComponentInstance(tag, id) as AppNode
}
