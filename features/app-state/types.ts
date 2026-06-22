export type PageBuilderMode = "edit" | "preview"

export interface AppNode {
  readonly tag: string
  readonly attributes: Readonly<Record<string, string>>
  readonly children: ReadonlyArray<AppNode | string>
}

export interface HistoryEntry {
  readonly id: string
  readonly action: string
  readonly timestamp: Date
  readonly pageState: ReadonlyArray<AppNode>
}

export interface AppState {
  readonly componentTree: ReadonlyArray<AppNode>
  readonly activePage: string
  readonly selectedComponentId: string
  readonly selectedComponentAncestors: ReadonlyArray<AppNode>
  readonly pageBuilderMode: PageBuilderMode
  readonly toolbarMinimized: boolean
  readonly showToolbar: boolean
  readonly history: ReadonlyArray<HistoryEntry>
  readonly currentHistoryIndex: number
  readonly historyPreviewIndex: number | null
  readonly originalHistoryState: ReadonlyArray<AppNode> | null
}

export type AppAction =
  | Readonly<{ type: "SET_PAGES"; payload: ReadonlyArray<AppNode> }>
  | Readonly<{ type: "ADD_PAGE"; payload: AppNode }>
  | Readonly<{ type: "UPDATE_PAGE"; payload: Readonly<{ id: string; updates: Partial<AppNode> }> }>
  | Readonly<{ type: "SET_ACTIVE_PAGE"; payload: string }>
  | Readonly<{
      type: "INSERT_COMPONENT"
      payload: Readonly<{ newComponentTag: string; parentId?: string; index?: number }>
    }>
  | Readonly<{ type: "UPDATE_COMPONENT"; payload: Readonly<{ componentId: string; updates: Partial<AppNode> }> }>
  | Readonly<{ type: "REMOVE_COMPONENT"; payload: Readonly<{ componentId: string }> }>
  | Readonly<{ type: "REPLACE_COMPONENT"; payload: Readonly<{ oldComponentId: string; newComponentTag: string }> }>
  | Readonly<{ type: "DUPLICATE_COMPONENT"; payload: Readonly<{ componentId: string; parentId?: string }> }>
  | Readonly<{ type: "SET_SELECTED_COMPONENT"; payload: string }>
  | Readonly<{ type: "SET_SELECTED_COMPONENT_ANCESTORS"; payload: string }>
  | Readonly<{ type: "SET_PAGE_BUILDER_MODE"; payload: PageBuilderMode }>
  | Readonly<{ type: "SET_TOOLBAR_MINIMIZED"; payload: boolean }>
  | Readonly<{ type: "SET_SHOW_TOOLBAR"; payload: boolean }>
  | Readonly<{ type: "ADD_TO_HISTORY"; payload: Readonly<{ action: string; pageState: ReadonlyArray<AppNode> }> }>
  | Readonly<{ type: "SET_CURRENT_HISTORY_INDEX"; payload: number }>
  | Readonly<{ type: "SET_HISTORY_PREVIEW_INDEX"; payload: number | null }>
  | Readonly<{ type: "SET_ORIGINAL_HISTORY_STATE"; payload: ReadonlyArray<AppNode> | null }>
  | Readonly<{ type: "RESTORE_FROM_HISTORY"; payload: Readonly<{ historyIndex: number }> }>
  | Readonly<{ type: "DISCARD_CHANGES" }>
