import type { ReactNode } from "react"

const componentTypes = [ "row", "column", "span", "paragraph", "heading1", "heading2", "heading3", "button", "image" ] as const;

// Component types
export type ComponentType = typeof componentTypes[number];

// Generic component attributes based on component type
export type ComponentAttributes<Tag extends ComponentType> =Tag extends "heading1" | "heading2" | "heading3"
  ? {
      content: string
    }
  : Tag extends "paragraph"
    ? {
        content: string
      }
    : Tag extends "span"
      ? {
          content: string
        }
      : Tag extends "button"
        ? {
            content: string
          }
        : Tag extends "image"
          ? {
              src: string
              alt: string
            }
          : Tag extends "row"
            ? {
                columns: number
              }
            : Tag extends "column"
              ? {}
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
export type ComponentProps = {
  component: any
  selectedComponent: string | null
  previewMode: boolean
  setSelectedComponent: (id: string | null) => void
  updateComponent: (id: string, props: any) => void
  removeComponent: (id: string) => void
  addComponent: (type: ComponentType, parentId?: string, position?: "prepend" | "append") => void
  duplicateComponent?: (id: string) => void
  componentProps?: any
  componentControls?: ReactNode
}

// Component data interface
export interface ComponentData<Tag extends ComponentType> {
  tag: Tag
  label: string
  icon: ReactNode
  keywords: string[]
  defaultProps: ComponentAttributes<Tag>
  settingsFields: string[]
  renderComponent: (params: ComponentProps) => React.JSX.Element
}
