import type { DesignComponent, DesignComponentTag } from "@/features/design-components/types";

function cloneComponentWithNewIds(
  component: DesignComponent<DesignComponentTag>,
  idSuffix: string
): DesignComponent<DesignComponentTag> {
  if (typeof component === "string") {
    return component;
  }
  const newId = `${component.attributes.id}${idSuffix}`;
  return {
    ...component,
    attributes: { ...component.attributes, id: newId, },
    children: component.children
      ? component.children.map(child => cloneComponentWithNewIds(child, idSuffix))
      : [],
  };
}
type FindParentTreeProps = {
  components: DesignComponent<DesignComponentTag>[];
  componentId: string;
};
/**
 * Return an array of Components that starts with the component with id = componentId first,
 * followed by its direct parent, followed by the parent's parent, and so on.
 * The last component in the array will be a direct child of state.componentTree
 */
export function findComponentParentTree({
  components, componentId,
}: FindParentTreeProps): DesignComponent<DesignComponentTag>[] {
  for (const component of components) {
    if (typeof component === "string") {
      continue;
    }
    if (component.attributes.id === componentId) {
      return [component];
    }
    if (component.children) {
      const parentTree = findComponentParentTree({ components: component.children, componentId });
      if (parentTree.length > 0) {
        return [...parentTree, component];
      }
    }
  }
  return [];
}
type InsertComponentProps = {
  components: DesignComponent<DesignComponentTag>[];
  newComponent: DesignComponent<DesignComponentTag>;
  parentId?: string;
  index?: number;
};
export function insertComponent({
  components, newComponent, parentId, index,
}: InsertComponentProps): DesignComponent<DesignComponentTag>[] {
  return components.reduce<DesignComponent<DesignComponentTag>[]>((acc, component, idx) => {
    if (typeof component === "string") {
      return [...acc, component];
    }
    const siblingIndexIsValid = typeof index === "number" && -1 < index && index < components.length;
    const siblingIndex = siblingIndexIsValid ? index : components.length;
    if (parentId === null || parentId === undefined && idx === siblingIndex) {
      return [...acc, newComponent, component];
    }
    // If this is the parent, insert the new component
    if (component.attributes.id === parentId) {
      const siblingIndexIsValid = typeof index === "number" && -1 < index && index < component.children.length;
      const siblingIndex = siblingIndexIsValid ? index : component.children.length;
      const parentComponent = {
        ...component,
        children: [
          ...component.children.slice(0, siblingIndex),
          newComponent,
          ...component.children.slice(siblingIndex),
        ],
      };
      return [...acc, parentComponent];
    }
    // Otherwise, recurse into children
    return [
      ...acc,
      {
        ...component,
        children: insertComponent({ components: component.children || [], newComponent, parentId, index }),
      },
    ];
  }, []);
}
type UpdateComponentProps = {
  components: DesignComponent<DesignComponentTag>[];
  componentId: string;
  updates: Partial<DesignComponent<DesignComponentTag>>;
  updated: { value: boolean; };
};
export function updateComponent({
  components, componentId, updates, updated,
}: UpdateComponentProps): DesignComponent<DesignComponentTag>[] {
  return components.map(component => {
    if (typeof component === "string") {
      return component;
    }
    if (component.attributes.id === componentId) {
      updated.value = true;
      return {
        ...component,
        attributes: { ...component.attributes, ...updates.attributes },
        children: updates.children ? updates.children : component.children,
      };
    }
    return {
      ...component,
      children: component.children ? updateComponent({ components: component.children, componentId, updates, updated }) : [],
    };
  });
}
type RemoveComponentProps = {
  components: DesignComponent<DesignComponentTag>[];
  componentId: string;
};
export function removeComponent({
  components, componentId,
}: RemoveComponentProps): DesignComponent<DesignComponentTag>[] {
  return components.reduce<DesignComponent<DesignComponentTag>[]>((acc, component) => {
    if (typeof component === "string") {
      return [...acc, component];
    }
    if (component.attributes.id === componentId) {
      return acc;
    }
    const updatedChildren = removeComponent({ components: component.children || [], componentId });
    return [...acc, { ...component, children: updatedChildren, }];
  }, []);
}
export function duplicateComponent({
  components, componentId,
}: {
  components: DesignComponent<DesignComponentTag>[];
  componentId: string;
}): DesignComponent<DesignComponentTag>[] {
  return components.reduce<DesignComponent<DesignComponentTag>[]>((acc, component) => {
    if (typeof component === "string") {
      return [...acc, component];
    }
    if (component.attributes.id === componentId) {
      const idSuffix = `-copy-${Date.now()}`;
      const duplicatedComponent = cloneComponentWithNewIds(component, idSuffix);
      return [...acc, component, duplicatedComponent];
    }
    // Otherwise, recurse into children
    return [
      ...acc,
      {
        ...component,
        children: duplicateComponent({ components: component.children || [], componentId }),
      },
    ];
  }, []);
}
type ReplaceComponentProps = {
  components: DesignComponent<DesignComponentTag>[];
  oldComponentId: string;
  newComponent: DesignComponent<DesignComponentTag>;
};
export function replaceComponent({ components, oldComponentId, newComponent }: ReplaceComponentProps): DesignComponent<DesignComponentTag>[] {
  return components.map(component => {
    if (typeof component === "string") {
      return component;
    }
    if (component.attributes.id === oldComponentId) {
      return newComponent;
    }
    return {
      ...component,
      children: component.children ? replaceComponent({ components: component.children, oldComponentId, newComponent }) : [],
    };
  });
}
