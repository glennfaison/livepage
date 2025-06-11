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
    if (state) {
      state.componentMap[component.id] = component
    }
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
  if (state.componentMap[componentId]) {
    return state.componentMap[componentId]
  }
  const component = _findComponentInArray(state.componentTree, componentId, state)
  if (component) {
    state.componentMap[componentId] = component
  }
  return component
}

/**
 * Return an array of Components that starts with the component with id = componentId first,
 * followed by its direct parent, followed by the parent's parent, and so on.
 * The last component in the array will be a direct child of state.componentTree
 *
 * @param {AppState} state
 * @param {string} componentId
 */
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

function insertComponent(
  state: AppState,
  newComponentTag: ComponentTag,
  parentId?: string,
  index?: number,
) {
  const parent = parentId ? findComponentById(state, parentId) : null
  const newComponent = createDesignComponent(newComponentTag, `${newComponentTag}-${generateId()}`)
  if (parent) {
    const siblingIndexIsValid = typeof index === "number" && -1 < index && index < parent.children.length
    const siblingIndex = siblingIndexIsValid ? index : parent.children.length
    parent.children = [...parent.children.slice(0, siblingIndex), newComponent, ...parent.children.slice(siblingIndex)]
  } else {
    const siblingIndexIsValid = typeof index === "number" && -1 < index && index < state.componentTree.length
    const siblingIndex = siblingIndexIsValid ? index : state.componentTree.length
    state.componentTree = [...state.componentTree.slice(0, siblingIndex), newComponent, ...state.componentTree.slice(siblingIndex)]
  }
  state.componentMap[newComponent.id] = newComponent
  state.selectedComponentId = newComponent.id
  return state
}

function updateComponent(
  state: AppState,
  componentId: string,
  updates: Partial<DesignComponent<ComponentTag>>,
) {
  const component = findComponentById(state, componentId)
  if (!component) {
    console.error(`Invalid component ID: ${componentId}`)
    return { ...state }
  }
  component.attributes = { ...component.attributes, ...updates.attributes }
  component.children = updates.children ? updates.children : component.children
  return state
}

function duplicateComponent(
  state: AppState,
  componentId: string,
  parentId?: string,
): AppState {
  let parent = parentId ? findComponentById(state, parentId) : null
  let component
  if (!parentId) {
    [component, parent] = findComponentParentTree(state, componentId)
  }

  component = parent ? _findComponentInArray(parent.children, componentId, state) : findComponentById(state, componentId)
  if (!component) {
    console.error(`Invalid component ID: ${componentId}`)
    return { ...state }
  }

  const duplicatedComponent = {
    ...JSON.parse(JSON.stringify(component)),
    id: `${component.id}-copy-${Date.now()}`,
    children: component.children.map(child => ({
      ...JSON.parse(JSON.stringify(child)),
      id: `${child.id}-copy-${Date.now()}`
    }))
  }
  if (parent) {
    const idx = parent.children.findIndex(child => child.id === componentId)
    parent.children = [
      ...parent.children.slice(0, idx + 1),
      duplicatedComponent,
      ...parent.children.slice(idx + 1)
    ]
  } else {
    const idx = state.componentTree.findIndex(child => child.id === componentId)
    state.componentTree = [
      ...state.componentTree.slice(0, idx + 1),
      duplicatedComponent,
      ...state.componentTree.slice(idx + 1)
    ]
  }

  state.componentMap[duplicatedComponent.id] = duplicatedComponent
  state.selectedComponentId = duplicatedComponent.id
  return state
}

function replaceComponent(
  state: AppState,
  oldComponentId: string,
  newComponentTag: ComponentTag,
) {
  const [component, parent] = findComponentParentTree(state, oldComponentId)
  if (!component) {
    console.error(`Invalid component ID: ${oldComponentId}`)
    return { ...state }
  }
  const newComponent = createDesignComponent(newComponentTag, `${newComponentTag}-${generateId()}`)
  const siblingIndex = parent.children.indexOf(component)
  parent.children = [...parent.children.slice(0, siblingIndex), newComponent, ...parent.children.slice(siblingIndex)]
  
  state.componentMap[newComponent.id] = newComponent
  state.selectedComponentId = newComponent.id
  return state
}

function deleteComponent(
  state: AppState,
  componentId: string,
) {
  const [component, parent] = findComponentParentTree(state, componentId)
  if (!component) {
    console.error(`Invalid component ID: ${componentId}`)
    return { ...state }
  }
  const siblingIndex = parent.children.indexOf(component)
  parent.children = [...parent.children.slice(0, siblingIndex), ...parent.children.slice(siblingIndex)]
  delete state.componentMap[component.id]
  state.selectedComponentId = state.selectedComponentId === componentId ? "" : state.selectedComponentId
  return state
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
  componentMap: {},
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
