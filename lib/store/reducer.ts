import { createDesignComponent } from "@/features/design-components"
import type { AppState, AppAction, HistoryEntry } from "./types"
import type { ComponentTag, DesignComponent } from "@/features/design-components/types"
import { generateId } from "../utils"

function _findComponentInArray(
  components: DesignComponent<ComponentTag>[],
  componentId: string,
  state?: AppState,
): DesignComponent<ComponentTag> | null {
  for (const component of components) {
    if (component.id === componentId) {
      return component
    }
    if (component.children) {
      const found = _findComponentInArray(component.children, componentId, state)
      if (found) return found
    }
  }
  return null
}

function findComponentById(
  state: AppState,
  componentId: string,
) {
  const component = _findComponentInArray(state.componentTree, componentId, state)
  return component
}

function cloneComponentWithNewIds(
  component: DesignComponent<ComponentTag>,
  idSuffix: string
): DesignComponent<ComponentTag> {
  const newId = `${component.id}${idSuffix}`
  return {
    ...component,
    id: newId,
    children: component.children
      ? component.children.map(child => cloneComponentWithNewIds(child, idSuffix))
      : [],
    attributes: { ...component.attributes },
  }
}

/**
 * Return an array of Components that starts with the component with id = componentId first,
 * followed by its direct parent, followed by the parent's parent, and so on.
 * The last component in the array will be a direct child of state.componentTree
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function findComponentParentTree(
  state: AppState,
  componentId: string,
) {
  const parentTree: DesignComponent<ComponentTag>[] = []
  let currentId = componentId

  while (true) {
    const component = findComponentById(state, currentId)
    if (!component) break
    parentTree.push(component)

    // Find parent by searching the tree for a component whose children include currentId
    let foundParent: DesignComponent<ComponentTag> | null = null
    const searchParent = (components: DesignComponent<ComponentTag>[]): boolean => {
      for (const comp of components) {
        if (comp.children && comp.children.some(child => child.id === currentId)) {
          foundParent = comp
          return true
        }
        if (comp.children && searchParent(comp.children)) {
          return true
        }
      }
      return false
    }
    if (!searchParent(state.componentTree)) break
    currentId = foundParent!.id
  }

  return parentTree
}

function _insertChildren(
  components: DesignComponent<ComponentTag>[],
  toInsert: DesignComponent<ComponentTag>,
  parentId?: string,
  index?: number,
): DesignComponent<ComponentTag>[] {
  return components.map(comp => {
    if (typeof comp === "string") {
      return comp
    }
    if (comp.id === parentId) {
      const siblingIndexIsValid = typeof index === "number" && -1 < index && index < comp.children.length
      const siblingIndex = siblingIndexIsValid ? index : comp.children.length
      return {
        ...comp,
        children: [
          ...comp.children.slice(0, siblingIndex),
          toInsert,
          ...comp.children.slice(siblingIndex),
        ],
      }
    }
    return {
      ...comp,
      children: comp.children ? _insertChildren(comp.children, toInsert, parentId, index) : [],
    }
  })
}

function insertComponent(
  state: AppState,
  newComponentTag: ComponentTag,
  parentId?: string,
  index?: number,
) {
  const newComponent = createDesignComponent(newComponentTag, generateId())
  let newComponentTree = state.componentTree
  if (parentId) {
    newComponentTree = _insertChildren(state.componentTree, newComponent, parentId, index)
  } else {
    // Insert at root
    const siblingIndexIsValid = typeof index === "number" && -1 < index && index < state.componentTree.length
    const siblingIndex = siblingIndexIsValid ? index : state.componentTree.length
    newComponentTree = [
      ...state.componentTree.slice(0, siblingIndex),
      newComponent,
      ...state.componentTree.slice(siblingIndex),
    ]
  }
  return {
    ...state,
    componentTree: newComponentTree,
    selectedComponentId: newComponent.id,
  }
}

// Immutable update
function updateComponent(
  state: AppState,
  componentId: string,
  updates: Partial<DesignComponent<ComponentTag>>,
) {
  let updated = false
  const updateInTree = (components: DesignComponent<ComponentTag>[]): DesignComponent<ComponentTag>[] =>
    components.map(comp => {
      if (comp.id === componentId) {
        updated = true
        return {
          ...comp,
          attributes: { ...comp.attributes, ...updates.attributes },
          children: updates.children ? updates.children : comp.children,
        }
      }
      return {
        ...comp,
        children: comp.children ? updateInTree(comp.children) : [],
      }
    })
  const newComponentTree = updateInTree(state.componentTree)
  if (!updated) {
    console.error(`Invalid component ID: ${componentId}`)
    return { ...state }
  }
  return {
    ...state,
    componentTree: newComponentTree,
  }
}

// Immutable duplicate
function duplicateComponent(
  state: AppState,
  componentId: string,
  parentId?: string,
): AppState {
  // Find parent and component
  let parent: DesignComponent<ComponentTag> | null = null
  let component: DesignComponent<ComponentTag> | null = null
  const findParentAndComponent = (
    components: DesignComponent<ComponentTag>[],
    parent: DesignComponent<ComponentTag> | null = null
  ): [DesignComponent<ComponentTag> | null, DesignComponent<ComponentTag> | null] => {
    for (const comp of components) {
      if (comp.id === componentId) return [parent, comp]
      if (comp.children) {
        const found = findParentAndComponent(comp.children, comp)
        if (found[1]) return found
      }
    }
    return [null, null]
  }
  if (parentId) {
    parent = findComponentById(state, parentId)
    component = parent ? _findComponentInArray(parent.children, componentId) : null
  } else {
    [parent, component] = findParentAndComponent(state.componentTree)
  }
  if (!component) {
    console.error(`Invalid component ID: ${componentId}`)
    return { ...state }
  }
  // Clone with new IDs
  const idSuffix = `-copy-${Date.now()}`
  const duplicatedComponent = cloneComponentWithNewIds(component, idSuffix)
  let newComponentTree = state.componentTree
  if (parent) {
    const insertToParent = (components: DesignComponent<ComponentTag>[]): DesignComponent<ComponentTag>[] =>
      components.map(comp => {
        if (comp.id === parent!.id) {
          const idx = comp.children.findIndex(child => child.id === componentId)
          return {
            ...comp,
            children: [
              ...comp.children.slice(0, idx + 1),
              duplicatedComponent,
              ...comp.children.slice(idx + 1),
            ],
          }
        }
        return {
          ...comp,
          children: comp.children ? insertToParent(comp.children) : [],
        }
      })
    newComponentTree = insertToParent(state.componentTree)
  } else {
    // Insert at root
    const idx = state.componentTree.findIndex(child => child.id === componentId)
    newComponentTree = [
      ...state.componentTree.slice(0, idx + 1),
      duplicatedComponent,
      ...state.componentTree.slice(idx + 1),
    ]
  }
  return {
    ...state,
    componentTree: newComponentTree,
    selectedComponentId: duplicatedComponent.id,
  }
}

// Immutable replace
function replaceComponent(
  state: AppState,
  oldComponentId: string,
  newComponentTag: ComponentTag,
) {
  // Find parent and component
  let parent: DesignComponent<ComponentTag> | null = null
  let component: DesignComponent<ComponentTag> | null = null
  const findParentAndComponent = (
    components: DesignComponent<ComponentTag>[],
    parent: DesignComponent<ComponentTag> | null = null
  ): [DesignComponent<ComponentTag> | null, DesignComponent<ComponentTag> | null] => {
    for (const comp of components) {
      if (comp.id === oldComponentId) return [parent, comp]
      if (comp.children) {
        const found = findParentAndComponent(comp.children, comp)
        if (found[1]) return found
      }
    }
    return [null, null]
  }
  [parent, component] = findParentAndComponent(state.componentTree)
  if (!component || !parent) {
    console.error(`Invalid component ID: ${oldComponentId}`)
    return { ...state }
  }
  const newComponent = createDesignComponent(newComponentTag, generateId())
  const replaceInParent = (components: DesignComponent<ComponentTag>[]): DesignComponent<ComponentTag>[] =>
    components.map(comp => {
      if (comp.id === parent!.id) {
        const idx = comp.children.findIndex(child => child.id === oldComponentId)
        return {
          ...comp,
          children: [
            ...comp.children.slice(0, idx),
            newComponent,
            ...comp.children.slice(idx + 1),
          ],
        }
      }
      return {
        ...comp,
        children: comp.children ? replaceInParent(comp.children) : [],
      }
    })
  const newComponentTree = replaceInParent(state.componentTree)
  return {
    ...state,
    componentTree: newComponentTree,
    selectedComponentId: newComponent.id,
  }
}

// Immutable delete
function deleteComponent(
  state: AppState,
  componentId: string,
) {
  // Find parent and component
  let parent: DesignComponent<ComponentTag> | null = null
  let component: DesignComponent<ComponentTag> | null = null
  const findParentAndComponent = (
    components: DesignComponent<ComponentTag>[],
    parent: DesignComponent<ComponentTag> | null = null
  ): [DesignComponent<ComponentTag> | null, DesignComponent<ComponentTag> | null] => {
    for (const comp of components) {
      if (comp.id === componentId) return [parent, comp]
      if (comp.children) {
        const found = findParentAndComponent(comp.children, comp)
        if (found[1]) return found
      }
    }
    return [null, null]
  }
  [parent, component] = findParentAndComponent(state.componentTree)
  if (!component || !parent) {
    console.error(`Invalid component ID: ${componentId}`)
    return { ...state }
  }
  const removeFromParent = (components: DesignComponent<ComponentTag>[]): DesignComponent<ComponentTag>[] =>
    components.map(comp => {
      if (comp.id === parent!.id) {
        return {
          ...comp,
          children: comp.children.filter(child => child.id !== componentId),
        }
      }
      return {
        ...comp,
        children: comp.children ? removeFromParent(comp.children) : [],
      }
    })
  const newComponentTree = removeFromParent(state.componentTree)
  return {
    ...state,
    componentTree: newComponentTree,
    selectedComponentId: state.selectedComponentId === componentId ? "" : state.selectedComponentId,
  }
}

export const initialState: AppState = {
  componentTree: [
    {
      tag: "page",
      id: "page-1",
      attributes: {
        title: "Home Page",
      },
      children: [
        // {id:"row-1",tag:"row",attributes:{},children:[{id:"header1-1",tag:"header1",attributes:{},children:[]}]}
      ],
    },
  ],
  activePage: "page-1",
  selectedComponentId: "",
  pageBuilderMode: "edit",
  toolbarMinimized: false,
  showToolbar: true,
  history: [],
  currentHistoryIndex: -1,
  historyPreviewIndex: null,
  originalHistoryState: null,
}

export function appReducer(state: AppState, action: AppAction): AppState {
  console.log("app reducer:", action)
  switch (action.type) {
    case "SET_PAGES":
      return {
        ...state,
        componentTree: action.payload,
      }

    case "ADD_PAGE":
      return {
        ...state,
        componentTree: [...state.componentTree, action.payload],
      }

    case "UPDATE_PAGE":
      return {
        ...state,
        componentTree: state.componentTree.map((page) =>
          page.id === action.payload.id ? { ...page, ...action.payload.updates } : page,
        ),
      }

    case "SET_ACTIVE_PAGE":
      return {
        ...state,
        activePage: action.payload,
      }

    case "ADD_COMPONENT": {
      const { newComponentTag, parentId, index = 0 } = action.payload
      return insertComponent(state, newComponentTag, parentId, index)
    }

    case "UPDATE_COMPONENT": {
      const { componentId, updates } = action.payload
      return updateComponent(state, componentId, updates)
    }

    case "REMOVE_COMPONENT": {
      const { componentId } = action.payload
      return deleteComponent(state, componentId)
    }

    case "DUPLICATE_COMPONENT": {
      const { componentId, parentId } = action.payload
      return duplicateComponent(state, componentId, parentId)
    }

    case "REPLACE_COMPONENT": {
      const { oldComponentId, newComponentTag } = action.payload
      return replaceComponent(state, oldComponentId, newComponentTag)
    }

    case "SET_SELECTED_COMPONENT":
      return {
        ...state,
        selectedComponentId: action.payload,
      }

    case "SET_PAGE_BUILDER_MODE":
      return {
        ...state,
        pageBuilderMode: action.payload,
      }

    case "SET_TOOLBAR_MINIMIZED":
      return {
        ...state,
        toolbarMinimized: action.payload,
      }

    case "SET_SHOW_TOOLBAR":
      return {
        ...state,
        showToolbar: action.payload,
      }

    case "ADD_TO_HISTORY": {
      const { action: historyAction, pageState } = action.payload
      const newEntry: HistoryEntry = {
        id: `history-${Date.now()}`,
        action: historyAction,
        timestamp: new Date(),
        pageState: JSON.parse(JSON.stringify(pageState)),
      }

      return {
        ...state,
        history: [...state.history, newEntry],
        currentHistoryIndex: state.currentHistoryIndex + 1,
      }
    }

    case "SET_CURRENT_HISTORY_INDEX":
      return {
        ...state,
        currentHistoryIndex: action.payload,
      }

    case "SET_HISTORY_PREVIEW_INDEX":
      return {
        ...state,
        historyPreviewIndex: action.payload,
      }

    case "SET_ORIGINAL_HISTORY_STATE":
      return {
        ...state,
        originalHistoryState: action.payload,
      }

    case "RESTORE_FROM_HISTORY": {
      const { historyIndex } = action.payload
      const selectedEntry = state.history[historyIndex]
      if (!selectedEntry) return state

      return {
        ...state,
        componentTree: JSON.parse(JSON.stringify(selectedEntry.pageState)),
        historyPreviewIndex: historyIndex,
        originalHistoryState: state.originalHistoryState || JSON.parse(JSON.stringify(state.componentTree)),
      }
    }

    case "DISCARD_CHANGES": {
      if (state.history.length > 1) {
        const firstEntry = state.history[0]
        return {
          ...state,
          componentTree: JSON.parse(JSON.stringify(firstEntry.pageState)),
          currentHistoryIndex: 0,
        }
      }
      return state
    }

    default:
      return state
  }
}