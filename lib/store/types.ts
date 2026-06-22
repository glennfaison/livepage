import { Node } from "@/features/shortcode-parser/parser"

// History entry
export interface HistoryEntry {
  id: string
  action: string
  timestamp: Date
  pageState: Node[]
}

// Application state
export interface AppState {
  componentTree: Node[]
  activePage: string
  selectedComponentId: string
  selectedComponentAncestors: Node[]
  pageBuilderMode: PageBuilderMode
  toolbarMinimized: boolean
  showToolbar: boolean
  history: HistoryEntry[]
  currentHistoryIndex: number
  historyPreviewIndex: number | null
  originalHistoryState: Node[] | null
}

// Action types
export type AppAction =
  | { type: "SET_PAGES"; payload: Node[] }
  | { type: "ADD_PAGE"; payload: Node }
  | { type: "UPDATE_PAGE"; payload: { id: string; updates: Partial<Node> } }
  | { type: "SET_ACTIVE_PAGE"; payload: string }
  | {
    type: "INSERT_COMPONENT"
    payload: { newComponentTag: string; parentId?: string; index?: number }
  }
  | { type: "UPDATE_COMPONENT"; payload: { componentId: string; updates: Partial<Node> } }
  | { type: "REMOVE_COMPONENT"; payload: { componentId: string } }
  | { type: "REPLACE_COMPONENT", payload: { oldComponentId: string, newComponentTag: string } }
  | {
    type: "DUPLICATE_COMPONENT"
    payload: { componentId: string; parentId?: string }
  }
  | { type: "SET_SELECTED_COMPONENT"; payload: string }
  | { type: "SET_SELECTED_COMPONENT_ANCESTORS"; payload: string }
  | { type: "SET_PAGE_BUILDER_MODE"; payload: PageBuilderMode }
  | { type: "SET_TOOLBAR_MINIMIZED"; payload: boolean }
  | { type: "SET_SHOW_TOOLBAR"; payload: boolean }
  | { type: "ADD_TO_HISTORY"; payload: { action: string; pageState: Node[] } }
  | { type: "SET_CURRENT_HISTORY_INDEX"; payload: number }
  | { type: "SET_HISTORY_PREVIEW_INDEX"; payload: number | null }
  | { type: "SET_ORIGINAL_HISTORY_STATE"; payload: Node[] | null }
  | { type: "RESTORE_FROM_HISTORY"; payload: { historyIndex: number } }
  | { type: "DISCARD_CHANGES" }

export type PageBuilderMode = "edit" | "preview"
