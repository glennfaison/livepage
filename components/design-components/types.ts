import type { ReactNode } from "react"

import type { ComponentAttributes as Header1Attributes } from "./header1";
import type { ComponentAttributes as Header2Attributes } from "./header2";
import type { ComponentAttributes as Header3Attributes } from "./header3";
import type { ComponentAttributes as ParagraphAttributes } from "./paragraph";
import type { ComponentAttributes as SpanAttributes } from "./span";
import type { ComponentAttributes as ButtonAttributes } from "./button";
import type { ComponentAttributes as ImageAttributes } from "./image";
import type { ComponentAttributes as RowAttributes } from "./row";
import type { ComponentAttributes as ColumnAttributes } from "./column";

const componentTypes = ['header1', 'header2', 'header3', 'paragraph', 'span', 'button', 'image', 'row', 'column'] as const

// Component types
export type ComponentType = typeof componentTypes[number];

// Generic component attributes based on component type
export type ComponentAttributes<Tag extends ComponentType> =
  Tag extends "header1" ? Header1Attributes
  : Tag extends "header2" ? Header2Attributes
  : Tag extends "header3" ? Header3Attributes
  : Tag extends "paragraph" ? ParagraphAttributes
  : Tag extends "span" ? SpanAttributes
  : Tag extends "button" ? ButtonAttributes
  : Tag extends "image" ? ImageAttributes
  : Tag extends "row" ? RowAttributes
  : Tag extends "column" ? ColumnAttributes
  : never

// Design component structure
export type DesignComponent<Tag extends ComponentType> = {
  id: string
  tag: Tag
  attributes: ComponentAttributes<Tag>
  children: DesignComponent<ComponentType>[]
  settingsFields?: Record<string, object>
}

// Page structure
export interface Page {
  id: string
  title: string
  attributes: Record<string, any>
  components: DesignComponent<ComponentType>[]
  settingsFields: Record<string, object>
}

// Component props type for renderComponent function
export type ComponentProps<Tag extends ComponentType> = {
  componentId: string
  pageBuilderMode: "edit" | "preview"
  setSelectedComponent: (id: string | null) => void
  updateComponent: (id: string, props: any) => void
  removeComponent: (id: string) => void
  addComponent: (args: { tag: ComponentType, parentId?: string, index?: number }) => void
  duplicateComponent?: (id: string) => void
  componentAttributes: ComponentAttributes<Tag>
}

// Component data interface
export interface ComponentInfo<Tag extends ComponentType> {
  tag: Tag
  label: string
  keywords: string[]
  defaultAttributes: ComponentAttributes<Tag>
  settingsFields: Record<string, object>
  Icon: ReactNode
  Component: (props: ComponentProps<Tag>) => React.JSX.Element
}
