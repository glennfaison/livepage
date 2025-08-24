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
import { PageBuilderMode } from "@/lib/store/types"

type DesignComponentTagnames = [
  "header1",
  "header2",
  "header3",
  "paragraph",
  "inline-text",
  "button",
  "image",
  "row",
  "column",
  "page"
]

// Component types
export type DesignComponentTag = DesignComponentTagnames[number]

interface Connectable {
  __datasource__?: string
}

// Generic component attributes based on component type
export type DesignComponentAttributes<Tag extends DesignComponentTag> =
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

export type DesignComponentSetting<Tag extends DesignComponentTag> = {
  id: keyof DesignComponentAttributes<Tag>
  label: string
  type: "text" | "number" | "boolean" | "textarea" | "select" | "color"
  description?: string
  required?: boolean
  min?: number // For number fields
  max?: number // For number fields
  step?: number // For number fields
  rows?: number // For textarea fields
  disabled?: boolean
  readOnly?: boolean
  placeholder?: string
  options?: string[] // For select fields
  defaultValue?: string | number | boolean
  getValue: (component: DesignComponent<Tag>) => string | number | boolean | string[]
  setValue: (component: Partial<DesignComponent<Tag>>, value: unknown) => DesignComponent<Tag>
}

export type DesignComponent<Tag extends DesignComponentTag> = {
  tag: Tag
  children: DesignComponent<DesignComponentTag>[]
  attributes: DesignComponentAttributes<Tag>
}

export type Page = DesignComponent<"page">

export type DesignComponentOperations<Tag extends DesignComponentTag> = {
  setSelectedComponent: (componentId: string) => void
  updateComponent: (componentId: string, updates: Partial<DesignComponent<Tag>>) => void
  removeComponent: (id: string) => void
  duplicateComponent?: (id: string) => void
  addComponent: (args: { tag: DesignComponentTag; parentId?: string; index?: number }) => void
  replaceComponent: (oldComponentId: string, newComponentTag: DesignComponentTag) => void
  findComponentById: (components: DesignComponent<DesignComponentTag>[], id: string) => DesignComponent<DesignComponentTag> | null
}

export type DesignComponentProps<Tag extends DesignComponentTag> = {
  pageBuilderMode: PageBuilderMode
  component: DesignComponent<Tag>
  selectedComponentId: string,
  selectedComponentAncestors: DesignComponent<DesignComponentTag>[]
}

export interface DesignComponentMetadata<Tag extends DesignComponentTag> {
  tag: Tag
  label: string
  keywords: string[]
  defaultChildren: DesignComponent<DesignComponentTag>[]
  defaultAttributes: DesignComponentAttributes<Tag>
  settingsFields: Record<keyof DesignComponentAttributes<Tag>, DesignComponentSetting<Tag>>
  Icon: ReactNode
  Component: (props: DesignComponentProps<Tag>) => React.JSX.Element
}
