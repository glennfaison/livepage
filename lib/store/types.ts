import type { ComponentTag, DesignComponent, Page, PageBuilderMode } from "@/features/design-components/types"

// History entry
export interface HistoryEntry {
  id: string
  action: string
  timestamp: Date
  pageState: DesignComponent<"page">[]
}

// Application state
export interface AppState {
  componentTree: DesignComponent<ComponentTag>[]
  activePage: string
  selectedComponentId: string
  selectedComponentAncestors: DesignComponent<ComponentTag>[]
  pageBuilderMode: PageBuilderMode
  toolbarMinimized: boolean
  showToolbar: boolean
  history: HistoryEntry[]
  currentHistoryIndex: number
  historyPreviewIndex: number | null
  originalHistoryState: Page[] | null
}

// Action types
export type AppAction =
  | { type: "SET_PAGES"; payload: DesignComponent<ComponentTag>[] }
  | { type: "ADD_PAGE"; payload: Page }
  | { type: "UPDATE_PAGE"; payload: { id: string; updates: Partial<Page> } }
  | { type: "SET_ACTIVE_PAGE"; payload: string }
  | {
    type: "INSERT_COMPONENT"
    payload: { newComponentTag: ComponentTag; parentId?: string; index?: number }
  }
  | { type: "UPDATE_COMPONENT"; payload: { componentId: string; updates: Partial<DesignComponent<ComponentTag>> } }
  | { type: "REMOVE_COMPONENT"; payload: { componentId: string } }
  | { type: "REPLACE_COMPONENT", payload: { oldComponentId: string, newComponentTag: ComponentTag } }
  | {
    type: "DUPLICATE_COMPONENT"
    payload: { componentId: string; parentId?: string }
  }
  | { type: "SET_SELECTED_COMPONENT"; payload: string }
  | { type: "SET_SELECTED_COMPONENT_ANCESTORS"; payload: string }
  | { type: "SET_PAGE_BUILDER_MODE"; payload: PageBuilderMode }
  | { type: "SET_TOOLBAR_MINIMIZED"; payload: boolean }
  | { type: "SET_SHOW_TOOLBAR"; payload: boolean }
  | { type: "ADD_TO_HISTORY"; payload: { action: string; pageState: DesignComponent<ComponentTag>[] } }
  | { type: "SET_CURRENT_HISTORY_INDEX"; payload: number }
  | { type: "SET_HISTORY_PREVIEW_INDEX"; payload: number | null }
  | { type: "SET_ORIGINAL_HISTORY_STATE"; payload: Page[] | null }
  | { type: "RESTORE_FROM_HISTORY"; payload: { historyIndex: number } }
  | { type: "DISCARD_CHANGES" }
