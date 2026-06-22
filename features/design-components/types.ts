import type React from "react"
import type { ReactNode } from "react"
import type { AppNode, PageBuilderMode } from "@/features/app-state"
import { appSettings } from "@/app/app-settings"

interface Connectable {
  [appSettings.dataSources.dataSourceFieldName]?: string
}

type BaseAttribute = Readonly<{
  id: string
  /** Optional label - dividers may have no label */
  label?: string
  description?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  placeholder?: string
}>

export type DesignComponentTag = string

// TODO: make getValue and setValue required
export type Attribute = Readonly<({
  type: "number"
  min?: number
  max?: number
  step?: number
  defaultValue: number
  getValue?: (node: AppNode) => number
  setValue?: (node: Partial<AppNode>, value: number) => AppNode
} | {
  type: "boolean"
  defaultValue: boolean
  getValue?: (node: AppNode) => boolean
  setValue?: (node: Partial<AppNode>, value: boolean) => AppNode
} | {
  type: "text"
  defaultValue: string
  getValue?: (node: AppNode) => string
  setValue?: (node: Partial<AppNode>, value: string) => AppNode
} | {
  type: "textarea"
  rows?: number
  defaultValue: (string | AppNode)[]
  getValue?: (node: AppNode) => (string | AppNode)[]
  setValue?: (node: Partial<AppNode>, value: (string | AppNode)[]) => AppNode
} | {
  type: "select"
  options?: string[]
  defaultValue: string | string[]
  getValue?: (node: AppNode) => string | string[]
  setValue?: (node: Partial<AppNode>, value: string | string[]) => AppNode
} | {
  type: "color"
  defaultValue: string
  getValue?: (node: AppNode) => string
  setValue?: (node: Partial<AppNode>, value: string) => AppNode
} | {
  type: "group"
  /** If true the group can be collapsed in the UI */
  collapsible?: boolean
  /** Initial collapsed state when rendered */
  collapsed?: boolean
  /** Nested attribute fields inside the group */
  fields: Attribute[]
  defaultValue: never
} | {
  type: "divider"
  // Horizontal divider (no extra fields)
  defaultValue: never
})> & BaseAttribute

export type Props = Readonly<{
  pageBuilderMode: PageBuilderMode
  component: Readonly<AppNode>
  selectedComponentId: string
  selectedComponentAncestors: Readonly<Readonly<AppNode>[]>
}>

export type EditModeProps = Readonly<Omit<Props, "pageBuilderMode"> & {
  pageBuilderMode: Extract<PageBuilderMode, "edit">
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
  readonly attributes: Readonly<Readonly<Attribute>[]>
  readonly ViewModeComponent: React.ComponentType<Readonly<ViewModeProps>>
  readonly EditModeComponent: React.ComponentType<Readonly<EditModeProps>>
}

export type Operations = {
  setSelectedComponent: (componentId: string) => void
  updateComponent: (componentId: string, updates: Partial<AppNode>) => void
  removeComponent: (id: string) => void
  duplicateComponent?: (id: string) => void
  addComponent: (args: { tag: string; parentId?: string; index?: number }) => void
  replaceComponent: (oldComponentId: string, newComponentTag: string) => void
  findComponentById: (components: AppNode[], id: string) => AppNode | null
}