import type React from "react"
import type { ReactNode } from "react"

import type { ComponentAttributes as ButtonAttributes } from "./button"
import type { ComponentAttributes as ColumnAttributes } from "./column"
import type { ComponentAttributes as Header1Attributes } from "./header1"
import type { ComponentAttributes as Header2Attributes } from "./header2"
import type { ComponentAttributes as Header3Attributes } from "./header3"
import type { ComponentAttributes as ImageAttributes } from "./image"
import type { ComponentAttributes as InlineTextAttributes } from "./inline-text"
import type { ComponentAttributes as PageAttributes } from "./page-component"
import type { ComponentAttributes as ParagraphAttributes } from "./paragraph"
import type { ComponentAttributes as RowAttributes } from "./row"

// Component types
export type ComponentTag =
  | "header1"
  | "header2"
  | "header3"
  | "paragraph"
  | "inline-text"
  | "button"
  | "image"
  | "row"
  | "column"
  | "page"

export type PageBuilderMode = "edit" | "preview"

interface Connectable {
  __data_source__?: string
}

// Generic component attributes based on component type
export type ComponentAttributes<Tag extends ComponentTag> =
  Tag extends "header1" ? (Header1Attributes & Connectable) :
  Tag extends "header2" ? (Header2Attributes & Connectable) :
  Tag extends "header3" ? (Header3Attributes & Connectable) :
  Tag extends "paragraph" ? (ParagraphAttributes & Connectable) :
  Tag extends "inline-text" ? (InlineTextAttributes & Connectable) :
  Tag extends "button" ? (ButtonAttributes & Connectable) :
  Tag extends "image" ? (ImageAttributes & Connectable) :
  Tag extends "row" ? (RowAttributes & Connectable) :
  Tag extends "column" ? (ColumnAttributes & Connectable) :
  Tag extends "page" ? (PageAttributes & Connectable) :
  never

export type SettingsField<Tag extends ComponentTag> = {
  id: keyof ComponentAttributes<Tag>
  label: string
  type: "text" | "number" | "boolean" | "textarea"
  placeholder?: string
  options?: string[] // For select fields
  defaultValue?: string | number | boolean
  getValue: (component: DesignComponent<Tag>) => string | number | boolean | string[]
  setValue: (component: Partial<DesignComponent<Tag>>, value: unknown) => DesignComponent<Tag>
}

export type DesignComponent<Tag extends ComponentTag> = {
  id: string
  tag: Tag
  children: DesignComponent<ComponentTag>[]
  attributes: ComponentAttributes<Tag>
}

export type Page = DesignComponent<"page">

export type ComponentOperations<Tag extends ComponentTag> = {
  setSelectedComponent: (componentId: string) => void
  updateComponent: (componentId: string, updates: Partial<DesignComponent<Tag>>) => void
  removeComponent: (id: string) => void
  duplicateComponent?: (id: string) => void
  addComponent: (args: { tag: ComponentTag; parentId?: string; index?: number }) => void
  replaceComponent: (oldComponentId: string, newComponentTag: ComponentTag) => void
  findComponentById: (components: DesignComponent<ComponentTag>[], id: string) => DesignComponent<ComponentTag> | null
}

export type ComponentProps<Tag extends ComponentTag> = {
  pageBuilderMode: PageBuilderMode
  component: DesignComponent<Tag>
  selectedComponentId: string,
}

export interface ComponentInfo<Tag extends ComponentTag> {
  tag: Tag
  label: string
  keywords: string[]
  defaultChildren: DesignComponent<ComponentTag>[]
  defaultAttributes: ComponentAttributes<Tag>
  settingsFields: Record<keyof ComponentAttributes<Tag>, SettingsField<Tag>>
  Icon: ReactNode
  Component: (props: ComponentProps<Tag>) => React.JSX.Element
}
