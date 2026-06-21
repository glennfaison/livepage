import type React from "react"
import type { ReactNode } from "react"
import { PageBuilderMode } from "@/lib/store/types"
import { Node } from "@/features/shortcode-parser/parser"

interface Connectable {
  __datasource__?: string
}

type BaseAttribute = {
  id: string
  /** Optional label - dividers may have no label */
  label?: string
  description?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  placeholder?: string
}

// TODO: make getValue and setValue required
export type Attribute = ({
  type: "number"
  min?: number
  max?: number
  step?: number
  options?: string[] // For select fields
  defaultValue?: number
  getValue?: (node: Node) => number
  setValue?: (node: Partial<Node>, value: number) => Node
} | {
  type: "boolean"
  defaultValue?: boolean
  getValue?: (node: Node) => boolean
  setValue?: (node: Partial<Node>, value: boolean) => Node
} | {
  type: "text"
  defaultValue?: string
  getValue?: (node: Node) => string
  setValue?: (node: Partial<Node>, value: string) => Node
} | {
  type: "textarea"
  rows?: number
  defaultValue?: (string | Node)[]
  getValue?: (node: Node) => (string | Node)[]
  setValue?: (node: Partial<Node>, value: (string | Node)[]) => Node
} | {
  type: "select"
  options?: string[]
  defaultValue?: string | string[]
  getValue?: (node: Node) => string | string[]
  setValue?: (node: Partial<Node>, value: string | string[]) => Node
} | {
  type: "color"
  defaultValue?: string
  getValue?: (node: Node) => string
  setValue?: (node: Partial<Node>, value: string) => Node
} | {
  type: "group"
  /** If true the group can be collapsed in the UI */
  collapsible?: boolean
  /** Initial collapsed state when rendered */
  collapsed?: boolean
  /** Nested attribute fields inside the group */
  fields: Attribute[]
  defaultValue?: undefined
} | {
  type: "divider"
  // Horizontal divider (no extra fields)
  defaultValue?: undefined
}) & BaseAttribute

export type Props = {
  pageBuilderMode: PageBuilderMode
  component: Node
  selectedComponentId: string,
  selectedComponentAncestors: Node[]
}

export interface Metadata {
  tag: string
  label: string
  keywords: string[]
  Icon: ReactNode
  defaultChildren: ReadonlyArray<Node | string>
  attributes: Attribute[]
  ViewModeComponent: React.ComponentType<any>
  EditModeComponent: React.ComponentType<any>
}

export type Operations = {
  setSelectedComponent: (componentId: string) => void
  updateComponent: (componentId: string, updates: Partial<Node>) => void
  removeComponent: (id: string) => void
  duplicateComponent?: (id: string) => void
  addComponent: (args: { tag: string; parentId?: string; index?: number }) => void
  replaceComponent: (oldComponentId: string, newComponentTag: string) => void
  findComponentById: (components: Node[], id: string) => Node | null
}