import type React from "react"
import type { AppNode, HistoryEntry, PageBuilderMode } from "@/features/app-state"
import type { DataSourceInfo } from "@/features/data-sources/types"
import type { Attribute, DesignComponentTag } from "@/features/design-components/types"

export type SettingsFieldInputModel = Readonly<{
  id: string
  label?: string
  type: "text" | "number" | "boolean" | "textarea" | "select" | "color"
  placeholder?: string
  options?: ReadonlyArray<string>
  description?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
}>

export type SettingsFieldInputProps = Readonly<{
  field: SettingsFieldInputModel
  value: string
  onChange: (value: string) => void
}>

export type SettingsPopoverProps = Readonly<{
  component: AppNode
  children: React.ReactNode
}>

export type ToolbarProps = Readonly<{
  toolbarMinimized: boolean
  pageBuilderMode: PageBuilderMode
  history: ReadonlyArray<HistoryEntry>
  currentHistoryIndex: number
  historyPreviewIndex: number | null
  setToolbarMinimized: (minimized: boolean) => void
  savePage: () => void
  handleDiscard: () => void
  onSelectHistory: (index: number) => void
  onAcceptHistory: (index: number) => void
  onDiscardHistory: () => void
}>

export type HistoryPopoverProps = Readonly<{
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  history: ReadonlyArray<HistoryEntry>
  currentHistoryIndex: number
  onSelectHistory: (index: number) => void
  onAccept: (index: number) => void
  onDiscard: () => void
  previewIndex: number | null
  children: React.ReactNode
}>

export type ComponentSelectorPopoverProps = Readonly<{
  onSelect: (type: DesignComponentTag) => void
  children: React.ReactNode
  componentTagList: ReadonlyArray<DesignComponentTag>
}>

export type ReplaceWithPopoverProps = Readonly<{
  children: React.ReactNode
  currentComponent: AppNode
  onReplace: (newType: DesignComponentTag) => void
}>

export type DividerProps = Readonly<{
  orientation: "horizontal" | "vertical"
  onAddComponent: (type: DesignComponentTag, index: number) => void
  index: number
  isVisible: boolean
}>

export type ComponentSettingsTabContentProps = Readonly<{
  settingsFields: ReadonlyArray<Attribute>
  formData: Readonly<Record<string, string>>
  handleDiscard: () => void
  handleFieldChange: (fieldId: string, value: string) => void
  handleSave: () => void
}>

export type DataSourceSettingsEditorState = Readonly<{
  searchDataSourceTerm: string
  filteredDataSources: ReadonlyArray<DataSourceInfo>
  selectedDataSource: DataSourceInfo | undefined
  isConnected: boolean
  formData: Readonly<Record<string, string>>
  settingsFields: ReadonlyArray<DataSourceInfo["settings"][number]>
  setSearchDataSourceTerm: React.Dispatch<React.SetStateAction<string>>
  setSelectedDataSource: React.Dispatch<React.SetStateAction<DataSourceInfo | undefined>>
  setFormData: React.Dispatch<React.SetStateAction<Readonly<Record<string, string>>>>
  handleSave: () => void
  handleDiscard: () => void
  handleFieldChange: (fieldId: string, value: string) => void
}>

export type DataSourceSettingsViewProps = Pick<
  DataSourceSettingsEditorState,
  "selectedDataSource" | "setSelectedDataSource" | "isConnected" | "handleSave" | "handleDiscard" | "handleFieldChange" | "settingsFields" | "formData"
>

export type ComponentSettingsEditorArgs = Readonly<{
  component: AppNode
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}>

export type DataSourceSettingsEditorArgs = Readonly<{
  component: AppNode
}>
