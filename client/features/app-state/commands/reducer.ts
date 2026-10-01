import type { AppAction, AppNode, AppState, HistoryEntry } from "@/client/features/types"
import { generateId } from "@/client/lib/utils"
import {
  insertComponent,
  updateComponent,
  removeComponent,
  duplicateComponent,
  replaceComponent,
  findComponentParentTree,
  findComponentById,
} from "./helpers"

export const initialState: AppState = {
  componentTree: [
    {
      tag: "page",
      attributes: {
        id: "page-1",
        title: "Home Page",
      },
      children: [],
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

/**
 * Appends a new history entry, discarding any "future" entries left over
 * from an earlier undo first.
 *
 * Both call sites used to append onto `state.history` unconditionally and
 * set `currentHistoryIndex` from the *old* array length / index. After an
 * undo (currentHistoryIndex pointing before the end of `history`), that left
 * the abandoned "future" entries in the array and pointed `currentHistoryIndex`
 * at the wrong slot, so a later redo could land on a stale, orphaned branch
 * instead of the edit that was just made. Slicing history down to the current
 * position before appending is the standard undo/redo-stack fix.
 */
function appendHistoryEntry(
  state: AppState,
  pageState: AppState["componentTree"],
  historyAction: string,
): Pick<AppState, "history" | "currentHistoryIndex"> {
  const newEntry: HistoryEntry = {
    id: generateId(),
    action: historyAction,
    timestamp: new Date(),
    pageState: JSON.parse(JSON.stringify(pageState)),
  }

  const historyUpToCurrent = state.history.slice(0, state.currentHistoryIndex + 1)

  return {
    history: [...historyUpToCurrent, newEntry],
    currentHistoryIndex: historyUpToCurrent.length,
  }
}

function withHistory(
  state: AppState,
  componentTree: AppState["componentTree"],
  historyAction: string,
): AppState {
  return {
    ...state,
    componentTree,
    ...appendHistoryEntry(state, componentTree, historyAction),
  }
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "INSERT_COMPONENT": {
      const { newComponent: providedComponent, newComponentTag, parentId, index } = action.payload
      const tag = (providedComponent?.tag ?? newComponentTag ?? "div") as string
      const componentId = providedComponent?.attributes?.id ?? generateId()
      const newComponent: AppNode = providedComponent ?? {
        tag,
        attributes: { id: componentId },
        children: [],
      }
      return withHistory(
        {
          ...state,
          componentTree: insertComponent({ components: state.componentTree, newComponent, parentId, index }),
          selectedComponentId: newComponent.attributes.id,
        },
        insertComponent({ components: state.componentTree, newComponent, parentId, index }),
        `Inserted ${tag}`,
      )
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
      return withHistory(
        {
        ...state,
        componentTree: newComponentTree,
        },
        newComponentTree,
        `Updated ${componentId}`,
      )
    }

    case "REMOVE_COMPONENT": {
      const { componentId } = action.payload
      if (!findComponentById(state.componentTree, componentId)) {
        return state
      }
      const newComponentTree = removeComponent({ components: state.componentTree, componentId })
      return withHistory(
        {
        ...state,
        componentTree: newComponentTree,
        selectedComponentId: state.selectedComponentId === componentId ? "" : state.selectedComponentId,
        },
        newComponentTree,
        `Removed ${componentId}`,
      )
    }

    case "DUPLICATE_COMPONENT": {
      const { componentId } = action.payload
      if (!findComponentById(state.componentTree, componentId)) {
        return state
      }
      const newTree = duplicateComponent({ components: state.componentTree, componentId })
      return withHistory(
        {
        ...state,
        componentTree: newTree,
        },
        newTree,
        `Duplicated ${componentId}`,
      )
    }

    case "REPLACE_COMPONENT": {
      const { oldComponentId, newComponent: providedComponent, newComponentTag } = action.payload
      if (!findComponentById(state.componentTree, oldComponentId)) {
        return state
      }
      const tag = (providedComponent?.tag ?? newComponentTag ?? "div") as string
      const componentId = providedComponent?.attributes?.id ?? generateId()
      const newComponent: AppNode = providedComponent ?? {
        tag,
        attributes: { id: componentId },
        children: [],
      }
      const newComponentTree = replaceComponent({ components: state.componentTree, oldComponentId, newComponent })
      return withHistory(
        {
          ...state,
          componentTree: newComponentTree,
          selectedComponentId: newComponent.attributes.id,
        },
        newComponentTree,
        `Replaced ${oldComponentId} with ${tag}`,
      )
    }

    case "SET_PAGES":
      return {
        ...state,
        componentTree: action.payload,
      }

    case "ADD_PAGE":
      return withHistory(
        {
        ...state,
        componentTree: [...state.componentTree, action.payload],
        },
        [...state.componentTree, action.payload],
        `Added page ${action.payload.attributes.id}`,
      )

    case "UPDATE_PAGE":
      return withHistory(
        {
          ...state,
          componentTree: state.componentTree.map((page) =>
            page.attributes.id === action.payload.id ? { ...page, ...action.payload.updates } : page,
          ),
        },
        state.componentTree.map((page) =>
          page.attributes.id === action.payload.id ? { ...page, ...action.payload.updates } : page,
        ),
        `Updated page ${action.payload.id}`,
      )

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

    case "SET_SELECTED_COMPONENT_ANCESTORS": {
      const ancestors = findComponentParentTree({ components: state.componentTree, componentId: action.payload })
      return {
        ...state,
        selectedComponentAncestors: ancestors.slice(1),
      }
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
      return {
        ...state,
        ...appendHistoryEntry(state, pageState, historyAction),
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
