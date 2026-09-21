import type React from "react"
import type { ReactNode } from "react"

export type PageBuilderMode = "edit" | "preview"

export type AppNodeTag = string

export type AppNode = Readonly<{
  tag: AppNodeTag
  attributes: Readonly<Record<string, string>>
  children: ReadonlyArray<AppNode | string>
}>

export type HistoryEntry = Readonly<{
  id: string
  action: string
  timestamp: Date
  pageState: ReadonlyArray<AppNode>
}>

export type AppState = Readonly<{
  componentTree: ReadonlyArray<AppNode>
  activePage: string
  selectedComponentId: string
  selectedComponentAncestors: ReadonlyArray<AppNode>
  pageBuilderMode: PageBuilderMode
  toolbarMinimized: boolean
  showToolbar: boolean
  history: ReadonlyArray<HistoryEntry>
  currentHistoryIndex: number
  historyPreviewIndex: number | null
  originalHistoryState: ReadonlyArray<AppNode> | null
}>

export type AppAction =
  | Readonly<{ type: "SET_PAGES"; payload: ReadonlyArray<AppNode> }>
  | Readonly<{ type: "ADD_PAGE"; payload: AppNode }>
  | Readonly<{ type: "UPDATE_PAGE"; payload: Readonly<{ id: string; updates: Partial<AppNode> }> }>
  | Readonly<{ type: "SET_ACTIVE_PAGE"; payload: string }>
  | Readonly<{
      type: "INSERT_COMPONENT"
      payload: Readonly<{ newComponentTag: AppNodeTag; parentId?: string; index?: number }>
    }>
  | Readonly<{ type: "UPDATE_COMPONENT"; payload: Readonly<{ componentId: string; updates: Partial<AppNode> }> }>
  | Readonly<{ type: "REMOVE_COMPONENT"; payload: Readonly<{ componentId: string }> }>
  | Readonly<{ type: "REPLACE_COMPONENT"; payload: Readonly<{ oldComponentId: string; newComponentTag: AppNodeTag }> }>
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

export type SettingsValue = string | number | boolean | ReadonlyArray<string>
export type SettingsFormData = Readonly<Record<string, SettingsValue>>

type SettingsFieldBase = Readonly<{
  id: string
  description?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
}>

type LabeledSettingsField = SettingsFieldBase &
  Readonly<{
    label: string
  }>

type ValueSettingsField<TType extends string, TValue, Extra extends object = object> = LabeledSettingsField &
  Readonly<{
    type: TType
    defaultValue: TValue
    getValue?: (node: AppNode) => TValue
    setValue?: (node: Partial<AppNode>, value: TValue) => AppNode
  }> &
  Extra

type NumberSettingsField = ValueSettingsField<
  "number",
  number,
  Readonly<{
    min?: number
    max?: number
    step?: number
    placeholder?: string
  }>
>

type BooleanSettingsField = ValueSettingsField<"boolean", boolean>

type TextSettingsField = ValueSettingsField<
  "text",
  string,
  Readonly<{
    placeholder?: string
  }>
>

type TextareaSettingsField = ValueSettingsField<
  "textarea",
  ReadonlyArray<string>,
  Readonly<{
    rows?: number
    placeholder?: string
    variant?: "function-body"
    functionName?: string
    functionParameters?: string
  }>
>

type SelectSettingsField = ValueSettingsField<
  "select",
  string,
  Readonly<{
    options?: ReadonlyArray<string>
    placeholder?: string
  }>
>

type MultiSelectSettingsField = ValueSettingsField<
  "multi-select",
  ReadonlyArray<string>,
  Readonly<{
    options?: ReadonlyArray<string>
    placeholder?: string
  }>
>

type ColorSettingsField = ValueSettingsField<
  "color",
  string,
  Readonly<{
    placeholder?: string
  }>
>

type GroupSettingsField = LabeledSettingsField &
  Readonly<{
    type: "group"
    collapsible?: boolean
    collapsed?: boolean
    fields: ReadonlyArray<SettingsField>
    defaultValue: never
  }>

type DividerSettingsField = SettingsFieldBase &
  Readonly<{
    type: "divider"
    label?: string
    defaultValue: never
  }>

export type SettingsField = Readonly<
  | NumberSettingsField
  | BooleanSettingsField
  | TextSettingsField
  | TextareaSettingsField
  | SelectSettingsField
  | MultiSelectSettingsField
  | ColorSettingsField
  | GroupSettingsField
  | DividerSettingsField
>

export type PrimitiveSettingsField = Exclude<SettingsField, GroupSettingsField | DividerSettingsField>

export type DataSourceId = string
export type DataSourceSettings = SettingsFormData

export interface DataSourceInfo {
  readonly id: DataSourceId
  readonly label: string
  readonly keywords: ReadonlyArray<string>
  readonly settings: ReadonlyArray<PrimitiveSettingsField>
  readonly Icon: ReactNode
  readonly tryConnection: (componentDataSourceSettings: Readonly<DataSourceSettings>) => Promise<unknown>
}

export type DataSourceInfoMap = Readonly<Record<DataSourceId, DataSourceInfo>>

export type Props = Readonly<{
  pageBuilderMode: PageBuilderMode
  component: AppNode
  selectedComponentId: string
  selectedComponentAncestors: ReadonlyArray<AppNode>
  childClassName?: string
}>

export type EditModeProps = Readonly<Omit<Props, "pageBuilderMode"> & {
  pageBuilderMode: Extract<PageBuilderMode, "edit">
  onMouseMove?: React.MouseEventHandler<HTMLElement>
  onMouseLeave?: React.MouseEventHandler<HTMLElement>
}>

export type ViewModeProps = Readonly<Omit<Props, "pageBuilderMode"> & {
  pageBuilderMode: Extract<PageBuilderMode, "preview">
}>

export interface Metadata {
  readonly tag: string
  readonly label: string
  readonly keywords: string[]
  readonly Icon: ReactNode
  readonly defaultChildren: ReadonlyArray<AppNode | string>
  readonly defaultAttributes?: Readonly<Record<string, unknown>>
  readonly attributes: ReadonlyArray<SettingsField>
  /** Browser-safe renderer used by previews and nested component rendering. */
  readonly PreviewModeComponent: React.ComponentType<ViewModeProps>
  readonly EditModeComponent: React.ComponentType<EditModeProps>
  /** HTML element used by the format-neutral HTML serializer. */
  readonly htmlTag?: string
  readonly htmlClassName?: string
}

export type Operations = Readonly<{
  setSelectedComponent: (componentId: string) => void
  updateComponent: (componentId: string, updates: Partial<AppNode>) => void
  removeComponent: (id: string) => void
  duplicateComponent?: (id: string) => void
  addComponent: (args: { tag: string; parentId?: string; index?: number }) => void
  replaceComponent: (oldComponentId: string, newComponentTag: string) => void
  findComponentById: (components: ReadonlyArray<AppNode | string>, id: string) => AppNode | null
}>
