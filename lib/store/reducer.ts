import type { AppState, AppAction, HistoryEntry } from "./types"
import type { ComponentAttributes, ComponentType, DesignComponent } from "@/components/design-components/types"

// Helper function to add component to parent
const addComponentToParent = (
  components: DesignComponent<ComponentType>[],
  parentId: string,
  newComponent: DesignComponent<ComponentType>,
  index: number,
): DesignComponent<ComponentType>[] => {
  return components.map((component) => {
    if (component.id === parentId) {
      const currentChildren = component.children || []
      return {
        ...component,
        children: [...currentChildren.slice(0, index), newComponent, ...currentChildren.slice(index)],
      }
    }

    if (component.children) {
      return {
        ...component,
        children: addComponentToParent(component.children, parentId, newComponent, index),
      }
    }

    return component
  })
}

// Helper function to update component in array
const updateComponentInArray = (
  components: DesignComponent<ComponentType>[],
  id: string,
  updates: Partial<ComponentAttributes<ComponentType>>,
): DesignComponent<ComponentType>[] => {
  return components.map((component) => {
    if (component.id === id) {
      return {
        ...component,
        attributes: { ...component.attributes, ...updates },
      }
    }

    if (component.children) {
      return {
        ...component,
        children: updateComponentInArray(component.children, id, updates),
      }
    }

    return component
  })
}

// Helper function to remove component from array
const removeComponentFromArray = (
  components: DesignComponent<ComponentType>[],
  id: string,
): DesignComponent<ComponentType>[] => {
  return components
    .filter((component) => component.id !== id)
    .map((component) => {
      if (component.children) {
        return {
          ...component,
          children: removeComponentFromArray(component.children, id),
        }
      }
      return component
    })
}

// Helper function to add duplicate component
const addDuplicateToParent = (
  components: DesignComponent<ComponentType>[],
  targetId: string,
  duplicatedComponent: DesignComponent<ComponentType>,
): DesignComponent<ComponentType>[] => {
  const result: DesignComponent<ComponentType>[] = []

  for (const component of components) {
    result.push(component)

    if (component.id === targetId) {
      result.push(duplicatedComponent)
    } else if (component.children) {
      const updatedComponent = {
        ...component,
        children: addDuplicateToParent(component.children, targetId, duplicatedComponent),
      }
      result[result.length - 1] = updatedComponent
    }
  }

  return result
}

export const initialState: AppState = {
  pages: [
    {
      id: "page-1",
      title: "Home Page",
      attributes: {},
      components: [],
    },
  ],
  activePage: "page-1",
  selectedComponentId: null,
  previewMode: false,
  toolbarMinimized: false,
  showToolbar: true,
  history: [],
  currentHistoryIndex: -1,
  historyPreviewIndex: null,
  originalHistoryState: null,
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_PAGES":
      return {
        ...state,
        pages: action.payload,
      }

    case "ADD_PAGE":
      return {
        ...state,
        pages: [...state.pages, action.payload],
      }

    case "UPDATE_PAGE":
      return {
        ...state,
        pages: state.pages.map((page) =>
          page.id === action.payload.id ? { ...page, ...action.payload.updates } : page,
        ),
      }

    case "SET_ACTIVE_PAGE":
      return {
        ...state,
        activePage: action.payload,
      }

    case "ADD_COMPONENT": {
      const { pageId, component, parentId, index = 0 } = action.payload
      return {
        ...state,
        pages: state.pages.map((page) => {
          if (page.id !== pageId) return page

          if (parentId) {
            return {
              ...page,
              components: addComponentToParent(page.components, parentId, component, index),
            }
          } else {
            return {
              ...page,
              components: [...page.components.slice(0, index), component, ...page.components.slice(index)],
            }
          }
        }),
        selectedComponentId: component.id,
      }
    }

    case "UPDATE_COMPONENT": {
      const { pageId, componentId, updates } = action.payload
      return {
        ...state,
        pages: state.pages.map((page) =>
          page.id === pageId
            ? {
                ...page,
                components: updateComponentInArray(page.components, componentId, updates),
              }
            : page,
        ),
      }
    }

    case "REMOVE_COMPONENT": {
      const { pageId, componentId } = action.payload
      return {
        ...state,
        pages: state.pages.map((page) =>
          page.id === pageId
            ? {
                ...page,
                components: removeComponentFromArray(page.components, componentId),
              }
            : page,
        ),
        selectedComponentId: state.selectedComponentId === componentId ? null : state.selectedComponentId,
      }
    }

    case "DUPLICATE_COMPONENT": {
      const { pageId, componentId, duplicatedComponent } = action.payload
      return {
        ...state,
        pages: state.pages.map((page) =>
          page.id === pageId
            ? {
                ...page,
                components: addDuplicateToParent(page.components, componentId, duplicatedComponent),
              }
            : page,
        ),
        selectedComponentId: duplicatedComponent.id,
      }
    }

    case "SET_SELECTED_COMPONENT":
      return {
        ...state,
        selectedComponentId: action.payload,
      }

    case "SET_PREVIEW_MODE":
      return {
        ...state,
        previewMode: action.payload,
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
        pages: JSON.parse(JSON.stringify(selectedEntry.pageState)),
        historyPreviewIndex: historyIndex,
        originalHistoryState: state.originalHistoryState || JSON.parse(JSON.stringify(state.pages)),
      }
    }

    case "DISCARD_CHANGES": {
      if (state.history.length > 1) {
        const firstEntry = state.history[0]
        return {
          ...state,
          pages: JSON.parse(JSON.stringify(firstEntry.pageState)),
          currentHistoryIndex: 0,
        }
      }
      return state
    }

    default:
      return state
  }
}
