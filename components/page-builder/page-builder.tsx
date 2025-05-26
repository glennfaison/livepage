"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Settings, Trash2, Move, Copy, GripVertical, Search, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"
import type {
  ComponentType,
  ComponentProps,
  DesignComponent,
  ComponentAttributes,
} from "@/components/design-components/types"
import { getComponentData } from "@/components/design-components/design-components"
import type { ReactNode } from "react"
import { generateId, intersperseAndAppend } from "@/lib/utils"

// Divider component for adding elements between existing ones
const Divider = ({
  orientation,
  onAddComponent,
  index,
  isVisible,
}: {
  orientation: "horizontal" | "vertical"
  onAddComponent: (type: ComponentType, index: number) => void
  index: number
  isVisible: boolean
}) => {
  const [popoverOpen, setPopoverOpen] = React.useState(false)

  const handleAddComponent = (type: ComponentType) => {
    onAddComponent(type, index)
    setPopoverOpen(false)
  }

  //if (!isVisible && !popoverOpen) return null

  return (
    <div
      className={cn(
        "relative flex items-center justify-center transition-all duration-200 group",
        "cursor-pointer z-10 bg-gray-300 hover:bg-gray-400",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        orientation === "horizontal" ? "h-px w-full hover:h-2" : "w-px hover:w-2",
        isVisible && (orientation === "horizontal" ? "h-1 bg-gray-400" : "w-1 bg-gray-400"),
      )}
    >
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("absolute bg-background border shadow-sm transition-opacity z-20", "h-6 w-6 rounded-full")}
            onClick={(e) => {
              e.stopPropagation()
              setPopoverOpen(true)
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <ComponentSelector onSelect={handleAddComponent} closePopover={() => setPopoverOpen(false)} />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Page component (legacy type for compatibility)
export type PageComponent = {
  id: string
  type: ComponentType
  content?: string
  src?: string
  alt?: string
  children?: PageComponent[]
}

// Helper function to create a new design component
export function createDesignComponent<T extends ComponentType>(
  type: T,
  id: string,
  overrideProps?: Partial<ComponentAttributes<T>>,
): DesignComponent<T> {
  const data = getComponentData(type)
  return {
    id,
    tag: type,
    attributes: { ...data.defaultProps, ...overrideProps } as ComponentAttributes<T>,
    children: [],
    settingsFields: data.settingsFields,
  }
}

export const componentData: { [Key in ComponentType]: DesignComponent<Key> } = {
  heading1: getComponentData("heading1"),
  heading2: getComponentData("heading2"),
  heading3: getComponentData("heading3"),
  paragraph: getComponentData("paragraph"),
  span: getComponentData("span"),
  button: getComponentData("button"),
  image: getComponentData("image"),
  row: getComponentData("row"),
  column: getComponentData("column"),
}

// Forward declaration for ComponentSelector
let ComponentSelector: React.ComponentType<{
  onSelect: (type: ComponentType) => void
  parentId?: string
  closePopover?: () => void
}>

// Component selector popup
const ComponentSelectorComponent = ({
  onSelect,
  parentId,
  closePopover,
}: {
  onSelect: (type: ComponentType) => void
  parentId?: string
  closePopover?: () => void
}) => {
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredComponents = React.useMemo(() => {
    const components = Object.values(componentData)
    if (!searchTerm.trim()) return components

    const search = searchTerm.toLowerCase()
    return components.filter(
      (component) =>
        component.label.toLowerCase().includes(search) ||
        component.keywords.some((keyword) => keyword.includes(search)),
    )
  }, [searchTerm])

  const handleSelect = (type: ComponentType) => {
    onSelect(type)
    if (closePopover) {
      closePopover()
    }
  }

  return (
    <div className="w-80">
      {/* Search Bar */}
      <div className="relative mb-3 p-2 border-b">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-8"
        />
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-3 gap-2 p-2 max-h-64 overflow-y-auto">
        {filteredComponents.length > 0 ? (
          filteredComponents.map((component) => (
            <ComponentSelectorButton
              key={component.type}
              icon={component.icon}
              label={component.label}
              onClick={() => handleSelect(component.type)}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-4 text-muted-foreground text-sm">No components found</div>
        )}
      </div>
    </div>
  )
}

// Set the ComponentSelector
ComponentSelector = ComponentSelectorComponent

// Component selector button
const ComponentSelectorButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) => {
  return (
    <Button variant="outline" size="sm" className="flex flex-col items-center h-auto py-2 gap-1" onClick={onClick}>
      <div className="p-1 bg-muted rounded-md">{icon}</div>
      <span className="text-xs">{label}</span>
    </Button>
  )
}

// Component popup with auto-close
export const ComponentPopover = ({
  children,
  onSelect,
  parentId,
}: {
  children: React.ReactNode
  onSelect: (type: ComponentType) => void
  parentId?: string
}) => {
  const [open, setOpen] = React.useState(false)

  const closePopover = () => {
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <ComponentSelector onSelect={onSelect} parentId={parentId} closePopover={closePopover} />
      </PopoverContent>
    </Popover>
  )
}

// Settings Popover Component
export interface SettingsPopoverProps {
  component: any
  onSave: (props: any) => void
  children: React.ReactNode
}

export const SettingsPopover: React.FC<SettingsPopoverProps> = ({ component, onSave, children }) => {
  const [formData, setFormData] = React.useState<any>({})
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 })
  const [isPositioned, setIsPositioned] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const popoverRef = React.useRef<HTMLDivElement>(null)

  const componentData = getComponentData(component.type || component.tag)

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        content: "",
        src: component.src || "",
        alt: component.alt || "",
      })
    }
  }, [isOpen, component])

  const handleSave = () => {
    onSave(formData)
    setIsOpen(false)
  }

  const handleDiscard = () => {
    setFormData({
      content: "",
      src: component.src || "",
      alt: component.alt || "",
    })
    setIsOpen(false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (popoverRef.current) {
      const rect = popoverRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
      setIsPositioned(true)
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className={cn("w-80", isPositioned && "fixed z-50", isDragging && "cursor-grabbing")}
        side="bottom"
        align="end"
        style={
          isPositioned
            ? {
                left: `${position.x}px`,
                top: `${position.y}px`,
                position: "fixed",
              }
            : undefined
        }
      >
        <div ref={popoverRef} className="bg-background border rounded-lg shadow-lg p-0">
          {/* Draggable Header */}
          <div
            className={cn(
              "bg-muted border-b p-3 rounded-t-lg flex items-center justify-between cursor-grab active:cursor-grabbing",
              isDragging && "cursor-grabbing",
            )}
            onMouseDown={handleMouseDown}
          >
            <h4 className="font-medium leading-none">
              {(component.type || component.tag).charAt(0).toUpperCase() + (component.type || component.tag).slice(1)}{" "}
              Settings
            </h4>
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="p-4 space-y-4">
            <div className="space-y-4">
              {componentData.settingsFields.includes("content") && (
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Input
                    id="content"
                    value={formData.content || ""}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, content: e.target.value }))}
                  />
                </div>
              )}

              {componentData.settingsFields.includes("src") && (
                <div className="space-y-2">
                  <Label htmlFor="src">Image URL</Label>
                  <Input
                    id="src"
                    value={formData.src || ""}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, src: e.target.value }))}
                  />
                </div>
              )}

              {componentData.settingsFields.includes("alt") && (
                <div className="space-y-2">
                  <Label htmlFor="alt">Alt Text</Label>
                  <Input
                    id="alt"
                    value={formData.alt || ""}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, alt: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDiscard} className="flex-1">
                Discard
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

//#region Wrapper Components

// Generic Design Component Wrapper
export const GenericDesignComponentWrapper = ({
  component,
  selectedComponent,
  previewMode,
  setSelectedComponent,
  updateComponent,
  removeComponent,
  addComponent,
  duplicateComponent,
}: ComponentProps) => {
  const isSelected = selectedComponent === component.id
  const componentType = component.type || component.tag

  const componentProps = {
    className: cn(
      "relative border border-transparent transition-all",
      isSelected && !previewMode && "border-primary",
      !previewMode && "hover:border-gray-300",
    ),
    onClick: (e: React.MouseEvent) => {
      if (!previewMode) {
        e.stopPropagation()
        setSelectedComponent(component.id)
      }
    },
  }

  const componentControls = !previewMode && isSelected && (
    <div className="absolute -top-8 right-0 flex gap-1 bg-background border rounded-t-md p-1 shadow-sm">
      <span className="text-xs font-medium px-2 flex items-center">
        {componentType.charAt(0).toUpperCase() + componentType.slice(1)}
      </span>
      <SettingsPopover component={component} onSave={(props) => updateComponent(component.id, props)}>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
          <Settings className="h-4 w-4" />
        </Button>
      </SettingsPopover>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation()
          duplicateComponent?.(component.id)
        }}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation()
          removeComponent(component.id)
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-6 w-6 cursor-move">
        <Move className="h-4 w-4" />
      </Button>
    </div>
  )

  const componentData = getComponentData(componentType)

  return (
    <div {...componentProps}>
      {componentControls}
      {componentData.renderComponent({
        component,
        selectedComponent,
        previewMode,
        setSelectedComponent,
        updateComponent,
        removeComponent,
        addComponent,
        duplicateComponent,
        componentProps,
        componentControls,
      })}
    </div>
  )
}

// Row Wrapper Component
export const RowWrapper = ({
  component,
  selectedComponent,
  previewMode,
  setSelectedComponent,
  updateComponent,
  removeComponent,
  addComponent,
  duplicateComponent,
}: ComponentProps) => {
  const isSelected = selectedComponent === component.id
  const [visibleDividers, setVisibleDividers] = React.useState<Set<number>>(new Set())
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const componentProps = {
    className: cn(
      "relative border border-transparent transition-all group",
      isSelected && !previewMode && "border-primary",
      !previewMode && "hover:border-gray-300",
    ),
    onClick: (e: React.MouseEvent) => {
      if (!previewMode) {
        e.stopPropagation()
        setSelectedComponent(component.id)
      }
    },
  }

  const componentControls = !previewMode && isSelected && (
    <div className="absolute -top-8 right-0 flex gap-1 bg-background border rounded-t-md p-1 shadow-sm">
      <span className="text-xs font-medium px-2 flex items-center">Row</span>
      <SettingsPopover component={component} onSave={(props) => updateComponent(component.id, props)}>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
          <Settings className="h-4 w-4" />
        </Button>
      </SettingsPopover>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation()
          duplicateComponent?.(component.id)
        }}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation()
          removeComponent(component.id)
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-6 w-6 cursor-move">
        <Move className="h-4 w-4" />
      </Button>
    </div>
  )

  // Handle adding component at specific index
  const handleAddAtIndex = (type: ComponentType, dividerIndex: number) => {
    const childIndex = Math.floor(dividerIndex / 2)
    const newComponent = createDesignComponent(type, generateId())
    addComponent(newComponent.tag, component.id, childIndex)
  }

  const showDivider = (index: number) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    setVisibleDividers((prev) => new Set(prev).add(index))
  }

  const hideDivider = (index: number) => {
    hideTimeoutRef.current = setTimeout(() => {
      setVisibleDividers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
    }, 300)
  }

  const handleChildMouseMove = (e: React.MouseEvent, childIndex: number) => {
    if (previewMode) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width

    if (x < width * 0.3) {
      const leftDividerIndex = childIndex * 2
      showDivider(leftDividerIndex)
    } else if (x > width * 0.7) {
      const rightDividerIndex = (childIndex + 1) * 2
      showDivider(rightDividerIndex)
    }
  }

  const handleChildMouseLeave = (childIndex: number) => {
    const leftDividerIndex = childIndex * 2
    const rightDividerIndex = childIndex * 2
    hideDivider(leftDividerIndex)
    hideDivider(rightDividerIndex)
  }

  const hasChildren = !!component.children

  const componentData = getComponentData(component.tag)
  const RowComponent = componentData.renderComponent;

  return (
    <div {...componentProps}>
      {componentControls}

      <RowComponent>
        {hasChildren
          ? !previewMode
            ? // Edit mode with dividers
              intersperseAndAppend(
                component.children.map((child: any, childIndex: number) => (
                  <div
                    key={child.id}
                    className="flex-1 relative"
                    onMouseMove={(e) => handleChildMouseMove(e, childIndex)}
                    onMouseLeave={() => handleChildMouseLeave(childIndex)}
                  >
                    {renderDesignComponent(
                      child,
                      selectedComponent,
                      previewMode,
                      setSelectedComponent,
                      updateComponent,
                      removeComponent,
                      addComponent,
                      duplicateComponent,
                    )}
                  </div>
                )),
                null,
              ).map((item, index) =>
                item === null ? (
                  <Divider
                    key={`divider-${index}`}
                    orientation="vertical"
                    onAddComponent={handleAddAtIndex}
                    index={index}
                    isVisible={visibleDividers.has(index)}
                  />
                ) : (
                  <React.Fragment key={index}>{item}</React.Fragment>
                ),
              )
            : // Preview mode without dividers
              component.children.map((child: any) => (
                <div key={child.id} className="flex-1">
                  {renderDesignComponent(
                    child,
                    selectedComponent,
                    previewMode,
                    setSelectedComponent,
                    updateComponent,
                    removeComponent,
                    addComponent,
                    duplicateComponent,
                  )}
                </div>
              ))
          : // Empty state - show centered add button
            !previewMode && (
              <div className="flex items-center justify-center h-full text-muted-foreground flex-1">
                <ComponentPopover onSelect={(type) => addComponent(type, component.id, 0)}>
                  <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                    <Plus className="h-6 w-6" />
                    <span className="sr-only">Add component</span>
                  </Button>
                </ComponentPopover>
              </div>
            )}
      </RowComponent>
    </div>
  )
}

// Column Wrapper Component
export const ColumnWrapper = ({
  component,
  selectedComponent,
  previewMode,
  setSelectedComponent,
  updateComponent,
  removeComponent,
  addComponent,
  duplicateComponent,
}: ComponentProps) => {
  const isSelected = selectedComponent === component.id
  const [visibleDividers, setVisibleDividers] = React.useState<Set<number>>(new Set())
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const componentProps = {
    className: cn(
      "relative border border-transparent transition-all",
      isSelected && !previewMode && "border-primary",
      !previewMode && "hover:border-gray-300",
    ),
    onClick: (e: React.MouseEvent) => {
      if (!previewMode) {
        e.stopPropagation()
        setSelectedComponent(component.id)
      }
    },
  }

  const componentControls = !previewMode && isSelected && (
    <div className="absolute -top-8 right-0 flex gap-1 bg-background border rounded-t-md p-1 shadow-sm">
      <span className="text-xs font-medium px-2 flex items-center">Column</span>
      <SettingsPopover component={component} onSave={(props) => updateComponent(component.id, props)}>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
          <Settings className="h-4 w-4" />
        </Button>
      </SettingsPopover>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation()
          duplicateComponent?.(component.id)
        }}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation()
          removeComponent(component.id)
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-6 w-6 cursor-move">
        <Move className="h-4 w-4" />
      </Button>
    </div>
  )

  // Handle adding component at specific index
  const handleAddAtIndex = (type: ComponentType, dividerIndex: number) => {
    const childIndex = Math.floor(dividerIndex / 2)
    const newComponent = createDesignComponent(type, generateId())
    addComponent(newComponent.tag, component.id, childIndex)
  }

  const showDivider = (index: number) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    setVisibleDividers((prev) => new Set(prev).add(index))
  }

  const hideDivider = (index: number) => {
    hideTimeoutRef.current = setTimeout(() => {
      setVisibleDividers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
    }, 500)
  }

  const handleChildMouseMove = (e: React.MouseEvent, childIndex: number) => {
    if (previewMode) return

    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const height = rect.height

    if (y < height * 0.3) {
      const topDividerIndex = childIndex * 2
      showDivider(topDividerIndex)
    } else if (y > height * 0.7) {
      const bottomDividerIndex = (childIndex + 1) * 2
      showDivider(bottomDividerIndex)
    }
  }

  const handleChildMouseLeave = (childIndex: number) => {
    const topDividerIndex = childIndex * 2
    const bottomDividerIndex = childIndex * 2
    hideDivider(topDividerIndex)
    hideDivider(bottomDividerIndex)
  }

  const hasChildren = !!component.children

  const componentData = getComponentData(component.tag)
  const ColumnComponent = componentData.renderComponent;

  return (
    <div {...componentProps}>
      {componentControls}

      <ColumnComponent>
        {hasChildren
          ? !previewMode
            ? // Edit mode with dividers
              intersperseAndAppend(
                component.children.map((child: any, childIndex: number) => (
                  <div
                    key={child.id}
                    className="relative"
                    onMouseMove={(e) => handleChildMouseMove(e, childIndex)}
                    onMouseLeave={() => handleChildMouseLeave(childIndex)}
                  >
                    {renderDesignComponent(
                      child,
                      selectedComponent,
                      previewMode,
                      setSelectedComponent,
                      updateComponent,
                      removeComponent,
                      addComponent,
                      duplicateComponent,
                    )}
                  </div>
                )),
                null,
              ).map((item, index) =>
                item === null ? (
                  <Divider
                    key={`divider-${index}`}
                    orientation="horizontal"
                    onAddComponent={handleAddAtIndex}
                    index={index}
                    isVisible={visibleDividers.has(index)}
                  />
                ) : (
                  <React.Fragment key={index}>{item}</React.Fragment>
                ),
              )
            : // Preview mode without dividers
              component.children.map((child: any) => (
                <div key={child.id}>
                  {renderDesignComponent(
                    child,
                    selectedComponent,
                    previewMode,
                    setSelectedComponent,
                    updateComponent,
                    removeComponent,
                    addComponent,
                    duplicateComponent,
                  )}
                </div>
              ))
          : // Empty state - show centered add button
            !previewMode && (
              <div className="flex items-center justify-center h-full w-full text-muted-foreground">
                <ComponentPopover onSelect={(type) => addComponent(type, component.id, 0)}>
                  <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                    <Plus className="h-6 w-6" />
                    <span className="sr-only">Add component</span>
                  </Button>
                </ComponentPopover>
              </div>
            )}
      </ColumnComponent>
    </div>
  )
}

//#endregion

// Get wrapper component function
export function getWrapperComponent<T extends ComponentType>(type: T): React.ComponentType<ComponentProps> {
  switch (type) {
    case "row":
      return RowWrapper as React.ComponentType<ComponentProps>
    case "column":
      return ColumnWrapper as React.ComponentType<ComponentProps>
    default:
      return GenericDesignComponentWrapper as React.ComponentType<ComponentProps>
  }
}

// Helper function to render a design component
export function renderDesignComponent(
  component: any, // Legacy component structure
  selectedComponent: string | null,
  previewMode: boolean,
  setSelectedComponent: (id: string | null) => void,
  updateComponent: (id: string, props: any) => void,
  removeComponent: (id: string) => void,
  addComponent: (type: ComponentType, parentId?: string, position?: "prepend" | "append") => void,
  duplicateComponent?: (id: string) => void,
  componentProps?: any,
  componentControls?: ReactNode,
): ReactNode {
  const componentType = component.tag || component.type
  const WrapperComponent = getWrapperComponent(componentType)

  return (
    <WrapperComponent
      component={component}
      selectedComponent={selectedComponent}
      previewMode={previewMode}
      setSelectedComponent={setSelectedComponent}
      updateComponent={updateComponent}
      removeComponent={removeComponent}
      addComponent={addComponent}
      duplicateComponent={duplicateComponent}
      componentProps={componentProps}
      componentControls={componentControls}
    />
  )
}

// Component renderer
export const renderComponent = (
  component: PageComponent,
  selectedComponent: string | null,
  previewMode: boolean,
  setSelectedComponent: (id: string | null) => void,
  updateComponent: (id: string, props: any) => void,
  removeComponent: (id: string) => void,
  addComponent: (type: ComponentType, parentId?: string, position?: "prepend" | "append") => void,
  duplicateComponent?: (id: string) => void,
): React.ReactNode => {
  const isSelected = selectedComponent === component.id

  const componentProps = {
    className: cn(
      "relative border border-transparent transition-all",
      isSelected && !previewMode && "border-primary",
      !previewMode && "hover:border-gray-300",
    ),
    onClick: (e: React.MouseEvent) => {
      if (!previewMode) {
        e.stopPropagation()
        setSelectedComponent(component.id)
      }
    },
  }

  const componentControls = !previewMode && isSelected && (
    <div className="absolute -top-8 right-0 flex gap-1 bg-background border rounded-t-md p-1 shadow-sm">
      <span className="text-xs font-medium px-2 flex items-center">
        {component.type.charAt(0).toUpperCase() + component.type.slice(1)}
      </span>
      <SettingsPopover component={component} onSave={(props) => updateComponent(component.id, props)}>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
          <Settings className="h-4 w-4" />
        </Button>
      </SettingsPopover>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation()
          duplicateComponent?.(component.id)
        }}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation()
          removeComponent(component.id)
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-6 w-6 cursor-move">
        <Move className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <div {...componentProps}>
      {componentControls}
      {renderDesignComponent(
        component,
        selectedComponent,
        previewMode,
        setSelectedComponent,
        updateComponent,
        removeComponent,
        addComponent,
        duplicateComponent,
        componentProps,
        componentControls,
      )}
    </div>
  )
}
