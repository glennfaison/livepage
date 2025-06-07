import type { AppState, AppAction, HistoryEntry } from "./types"
import type { ComponentAttributes, ComponentTag, DesignComponent } from "@/features/design-components/types"

// Helper function to add component to parent
const addComponentToParent = (
  children: DesignComponent<ComponentTag>[],
  parentId: string,
  newComponent: DesignComponent<ComponentTag>,
  index: number,
): DesignComponent<ComponentTag>[] => {
  return children.map((component) => {
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
  children: DesignComponent<ComponentTag>[],
  id: string,
  updates: Partial<ComponentAttributes<ComponentTag>>,
): DesignComponent<ComponentTag>[] => {
  return children.map((component) => {
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

// Helper function to replace component in array
const replaceComponentInArray = (
  children: DesignComponent<ComponentTag>[],
  oldComponentId: string,
  newComponent: DesignComponent<ComponentTag>,
): DesignComponent<ComponentTag>[] => {
  return children.map((component) => {
    if (component.id === oldComponentId) {
      return newComponent
    }

    if (component.children) {
      return {
        ...component,
        children: replaceComponentInArray(component.children, oldComponentId, newComponent),
      }
    }

    return component
  })
}

// Helper function to remove component from array
const removeComponentFromArray = (
  children: DesignComponent<ComponentTag>[],
  id: string,
): DesignComponent<ComponentTag>[] => {
  return children
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
  children: DesignComponent<ComponentTag>[],
  targetId: string,
  duplicatedComponent: DesignComponent<ComponentTag>,
): DesignComponent<ComponentTag>[] => {
  const result: DesignComponent<ComponentTag>[] = []

  for (const component of children) {
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
              children: addComponentToParent(page.children, parentId, component, index),
            }
          } else {
            return {
              ...page,
              children: [...page.children.slice(0, index), component, ...page.children.slice(index)],
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
              children: updateComponentInArray(page.children, componentId, updates),
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
              children: removeComponentFromArray(page.children, componentId),
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
              children: addDuplicateToParent(page.children, componentId, duplicatedComponent),
            }
            : page,
        ),
        selectedComponentId: duplicatedComponent.id,
      }
    }

    case "REPLACE_COMPONENT": {
      const { pageId, oldComponentId, newComponent } = action.payload
      return {
        ...state,
        pages: state.pages.map((page) =>
          page.id === pageId
            ? {
              ...page,
              children: replaceComponentInArray(page.children, oldComponentId, newComponent),
            }
            : page,
        ),
        selectedComponentId: newComponent.id,
      }
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
