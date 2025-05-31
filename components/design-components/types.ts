import type React from "react"
import type { ReactNode } from "react"

import type { ComponentAttributes as Header1Attributes } from "./header1"
import type { ComponentAttributes as Header2Attributes } from "./header2"
import type { ComponentAttributes as Header3Attributes } from "./header3"
import type { ComponentAttributes as ParagraphAttributes } from "./paragraph"
import type { ComponentAttributes as SpanAttributes } from "./span"
import type { ComponentAttributes as ButtonAttributes } from "./button"
import type { ComponentAttributes as ImageAttributes } from "./image"
import type { ComponentAttributes as RowAttributes } from "./row"
import type { ComponentAttributes as ColumnAttributes } from "./column"

// Component types
export type ComponentType =
  | "header1"
  | "header2"
  | "header3"
  | "paragraph"
  | "span"
  | "button"
  | "image"
  | "row"
  | "column"

// Generic component attributes based on component type
export type ComponentAttributes<Tag extends ComponentType> = Tag extends "header1"
  ? Header1Attributes
  : Tag extends "header2"
  ? Header2Attributes
  : Tag extends "header3"
  ? Header3Attributes
  : Tag extends "paragraph"
  ? ParagraphAttributes
  : Tag extends "span"
  ? SpanAttributes
  : Tag extends "button"
  ? ButtonAttributes
  : Tag extends "image"
  ? ImageAttributes
  : Tag extends "row"
  ? RowAttributes
  : Tag extends "column"
  ? ColumnAttributes
  : never

export type PageBuilderMode = "edit" | "view"

export type SettingsField<Tag extends ComponentType> = {
  id: keyof ComponentAttributes<Tag>
  label: string
  type: "text" | "number" | "boolean" | "textarea"
  placeholder?: string
  options?: string[] // For select fields
}

// Design component structure
export type DesignComponent<Tag extends ComponentType> = {
  id: string
  tag: Tag
  children: DesignComponent<ComponentType>[]
  attributes: ComponentAttributes<Tag>
  settingsFields: Record<keyof ComponentAttributes<Tag>, SettingsField<Tag>>
}

// Page structure
export interface Page {
  id: string
  title: string
  components: DesignComponent<ComponentType>[]
  attributes: Record<string, string>
}

export type ComponentOperations<Tag extends ComponentType> = {
  setSelectedComponent: (componentId: string) => void
  updateComponent: (componentId: string, updates: Partial<ComponentAttributes<Tag>>) => void
  removeComponent: (id: string) => void
  duplicateComponent?: (id: string) => void
  addComponent: (args: { type: ComponentType; parentId?: string; index?: number }) => void
  replaceComponent: (oldComponentId: string, newComponentTag: ComponentType) => void
}

// Component props type for renderComponent function
export type ComponentProps<Tag extends ComponentType> = {
  pageBuilderMode: PageBuilderMode
  componentId: string
  attributes: ComponentAttributes<Tag>
  children?: React.ReactNode
} & ComponentOperations<Tag>

export type ComponentWrapperProps<Tag extends ComponentType> = {
  component: DesignComponent<Tag>
  selectedComponentId: string | null
} & Omit<ComponentProps<Tag>, "componentId" | "attributes">

export type ComponentControlsProps<Tag extends ComponentType> = {
  component: DesignComponent<Tag>
} & Omit<ComponentOperations<Tag>, "addComponent" | "setSelectedComponent">

// Component data interface - updated to match actual exports
export interface ComponentInfo<Tag extends ComponentType> {
  tag: Tag
  label: string
  keywords: string[]
  defaultAttributes: ComponentAttributes<Tag>
  settingsFields: Record<keyof ComponentAttributes<Tag>, SettingsField<Tag>>
  Icon: ReactNode
  Component: (props: ComponentProps<Tag>) => React.JSX.Element
}
