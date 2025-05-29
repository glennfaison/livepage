import type { ComponentAttributes, ComponentType, DesignComponent, Page } from "@/components/design-components/types"

// History entry
export interface HistoryEntry {
  id: string
  action: string
  timestamp: Date
  pageState: Page[]
}

// Application state
export interface AppState {
  pages: Page[]
  activePage: string
  selectedComponentId: string | null
  previewMode: boolean
  toolbarMinimized: boolean
  showToolbar: boolean
  history: HistoryEntry[]
  currentHistoryIndex: number
  historyPreviewIndex: number | null
  originalHistoryState: Page[] | null
}

// Action types
export type AppAction =
  | { type: "SET_PAGES"; payload: Page[] }
  | { type: "ADD_PAGE"; payload: Page }
  | { type: "UPDATE_PAGE"; payload: { id: string; updates: Partial<Page> } }
  | { type: "SET_ACTIVE_PAGE"; payload: string }
  | {
    type: "ADD_COMPONENT"
    payload: { pageId: string; component: DesignComponent<ComponentType>; parentId?: string; index?: number }
  }
  | { type: "UPDATE_COMPONENT"; payload: { pageId: string; componentId: string; updates: Partial<ComponentAttributes<ComponentType>> } }
  | { type: "REMOVE_COMPONENT"; payload: { pageId: string; componentId: string } }
  | {
    type: "DUPLICATE_COMPONENT"
    payload: { pageId: string; componentId: string; duplicatedComponent: DesignComponent<ComponentType> }
  }
  | { type: "REPLACE_COMPONENT", payload: { pageId: string, oldComponentId: string, newComponent: DesignComponent<ComponentType> } }
  | { type: "SET_SELECTED_COMPONENT"; payload: string | null }
  | { type: "SET_PREVIEW_MODE"; payload: boolean }
  | { type: "SET_TOOLBAR_MINIMIZED"; payload: boolean }
  | { type: "SET_SHOW_TOOLBAR"; payload: boolean }
  | { type: "ADD_TO_HISTORY"; payload: { action: string; pageState: Page[] } }
  | { type: "SET_CURRENT_HISTORY_INDEX"; payload: number }
  | { type: "SET_HISTORY_PREVIEW_INDEX"; payload: number | null }
  | { type: "SET_ORIGINAL_HISTORY_STATE"; payload: Page[] | null }
  | { type: "RESTORE_FROM_HISTORY"; payload: { historyIndex: number } }
  | { type: "DISCARD_CHANGES" }
