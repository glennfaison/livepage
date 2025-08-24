import { createDesignComponent } from "@/features/design-components"
import type { AppState, AppAction, HistoryEntry } from "../types"
import { generateId } from "../../utils"
import { insertComponent, updateComponent, removeComponent, duplicateComponent, replaceComponent, findComponentParentTree } from "./helpers"

export const initialState: AppState = {
  componentTree: [
    {
      tag: "page",
      attributes: {
        id: "page-1",
        title: "Home Page",
      },
      children: [
        // {tag:"row",attributes:{id:"row-1",},children:[{tag:"header1",attributes:{id:"header1-1"},children:[]}]}
      ],
    },
  ],
  activePage: "page-1",
  selectedComponentId: "",
  selectedComponentAncestors: [],
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

    case "INSERT_COMPONENT": {
      const { newComponentTag, parentId, index } = action.payload
      const componentId = generateId()
      const newComponent = createDesignComponent(newComponentTag, componentId)
      return {
        ...state,
        componentTree: insertComponent({ components: state.componentTree, newComponent, parentId, index }),
        selectedComponentId: newComponent.attributes.id,
      }
    }

    case "UPDATE_COMPONENT": {
      const { componentId, updates } = action.payload
      const updated = { value: false }
      const newComponentTree = updateComponent({
        components: state.componentTree,
        componentId,
        updates,
        updated,
      })
      if (!updated.value) {
        console.error(`Invalid component ID: ${componentId}`)
        return { ...state }
      }
      return {
        ...state,
        componentTree: newComponentTree,
      }
    }

    case "REMOVE_COMPONENT": {
      const { componentId } = action.payload
      const newComponentTree = removeComponent({ components: state.componentTree, componentId, })
      return {
        ...state,
        componentTree: newComponentTree,
        selectedComponentId: state.selectedComponentId === componentId ? "" : state.selectedComponentId,
      }
    }

    case "DUPLICATE_COMPONENT": {
      const { componentId } = action.payload
      return {
        ...state,
        componentTree: duplicateComponent({ components: state.componentTree, componentId }),
      }
    }

    case "REPLACE_COMPONENT": {
      const { oldComponentId, newComponentTag } = action.payload
      const newComponent = createDesignComponent(newComponentTag, generateId())
      const newComponentTree = replaceComponent({ components: state.componentTree, oldComponentId, newComponent })
      return {
        ...state,
        componentTree: newComponentTree,
        selectedComponentId: newComponent.attributes.id,
      }
    }

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
          page.attributes.id === action.payload.id ? { ...page, ...action.payload.updates } : page,
        ),
      }

    case "SET_ACTIVE_PAGE":
      return {
        ...state,
        activePage: action.payload,
      }

    case "SET_SELECTED_COMPONENT":
      return {
        ...state,
        selectedComponentId: action.payload,
      }

    case "SET_SELECTED_COMPONENT_ANCESTORS":
      const ancestors = findComponentParentTree({ components: state.componentTree, componentId: action.payload })
      return {
        ...state,
        selectedComponentAncestors: ancestors.slice(1),
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