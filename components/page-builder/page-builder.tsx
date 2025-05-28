"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Settings, Trash2, Move, Copy, Search, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"
import type {
  ComponentType,
  DesignComponent,
  ComponentAttributes,
  ComponentInfo,
  ComponentWrapperProps,
  ComponentControlsProps,
} from "@/components/design-components/types"
import { getComponentInfo } from "@/components/design-components"
import type { ReactNode } from "react"
import { generateId, intersperseAndAppend } from "@/lib/utils"
import { SettingsPopover } from "./settings-popover"

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
  isVisible = isVisible || popoverOpen

  const handleAddComponent = (type: ComponentType) => {
    onAddComponent(type, index)
    setPopoverOpen(false)
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center transition-all duration-200 group",
        "cursor-pointer bg-transparent hover:bg-gray-400",
        isVisible ? "bg-gray-400": "invisible",
        orientation === "horizontal" ? "flex-row h-px w-full hover:h-2" : "flex-col w-px hover:w-2",
        isVisible && (orientation === "horizontal" ? "h-1" : "w-1"),
      )}
    >
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("absolute bg-background border shadow-sm transition-opacity z-20 h-6 w-6 rounded-full")}
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

// Helper function to create a new design component
export function createDesignComponent<Tag extends ComponentType>(
  tag: Tag,
  id: string,
  overrideProps?: Partial<ComponentAttributes<Tag>>,
): DesignComponent<Tag> {
  const data = getComponentInfo(tag)
  return {
    id,
    tag: tag,
    attributes: { ...data.defaultAttributes, ...overrideProps } as ComponentAttributes<Tag>,
    children: [],
    settingsFields: data.settingsFields,
  }
}

const componentInfo: { [Key in ComponentType]: ComponentInfo<Key> } = {
  header1: getComponentInfo("header1"),
  header2: getComponentInfo("header2"),
  header3: getComponentInfo("header3"),
  paragraph: getComponentInfo("paragraph"),
  span: getComponentInfo("span"),
  button: getComponentInfo("button"),
  image: getComponentInfo("image"),
  row: getComponentInfo("row"),
  column: getComponentInfo("column"),
}

// Component selector popup
const ComponentSelector = ({
  onSelect,
  closePopover,
}: {
  onSelect: (type: ComponentType) => void
  parentId?: string
  closePopover?: () => void
}) => {
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredComponents = React.useMemo(() => {
    const components = Object.values(componentInfo)
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
              key={component.tag}
              icon={component.Icon}
              label={component.label}
              onClick={() => handleSelect(component.tag)}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-4 text-muted-foreground text-sm">No components found</div>
        )}
      </div>
    </div>
  )
}

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

//#region Wrapper Components

function ComponentControls<Tag extends ComponentType>({ component, updateComponent, duplicateComponent, removeComponent }: ComponentControlsProps<Tag>) {
  const _componentInfo = componentInfo[component.tag as ComponentType]
  const { label } = _componentInfo

  return (
    <div className="absolute -top-8 right-0 flex gap-1 bg-background border rounded-t-md p-1 shadow-sm">
      <span className="text-xs font-medium px-2 flex items-center">
        {label}
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
}

// Generic Design Component Wrapper
export const GenericDesignComponentWrapper = ({
  component,
  selectedComponentId,
  setSelectedComponent,
  updateComponent,
  removeComponent,
  addComponent,
  duplicateComponent,
}: ComponentWrapperProps<Exclude<ComponentType, "row" | "column">>) => {
  const componentType = component.tag
  const showControls = selectedComponentId === component.id
  const componentProps = {
    className: cn(
      "relative border border-transparent transition-all",
      showControls && "border-primary",
      "hover:border-gray-300",
    ),
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation()
      setSelectedComponent(component.id)
    },
  }

  const componentControls = selectedComponentId === component.id && ComponentControls({
    component,
    updateComponent,
    duplicateComponent,
    removeComponent,
  })

  const componentData = React.useMemo(() => getComponentInfo(componentType), [componentType])

  return (
    <div {...componentProps}>
      {componentControls}
      {componentData.Component({
        componentId: component.id,
        attributes: component.attributes,
        setSelectedComponent,
        updateComponent,
        removeComponent,
        addComponent,
        duplicateComponent,
      })}
    </div>
  )
}

// Row Wrapper Component
export const RowWrapper = ({
  component,
  selectedComponentId,
  pageBuilderMode,
  setSelectedComponent,
  updateComponent,
  removeComponent,
  addComponent,
  duplicateComponent,
}: ComponentWrapperProps<"row">) => {
  const [visibleDividers, setVisibleDividers] = React.useState<Set<number>>(new Set())
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const showControls = selectedComponentId === component.id

  const componentProps = {
    className: cn(
      "relative border border-transparent transition-all group",
      showControls && "border-primary",
      "hover:border-gray-300",
    ),
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation()
      setSelectedComponent(component.id)
    },
  }

  const componentControls = showControls && ComponentControls({
    component,
    updateComponent,
    duplicateComponent,
    removeComponent,
  })

  // Handle adding component at specific index
  const handleAddAtIndex = (type: ComponentType, dividerIndex: number) => {
    const childIndex = Math.floor(dividerIndex / 2)
    const newComponent = createDesignComponent(type, generateId())
    addComponent({ type: newComponent.tag, parentId: component.id, index: childIndex })
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
  const componentData = getComponentInfo(component.tag)
  const RowComponent = componentData.Component

  const children = component.children.map(<Tag extends ComponentType>(child: DesignComponent<Tag>, childIndex: number) => (
    <div
      key={child.id}
      className="flex-1 relative"
      onMouseMove={(e) => handleChildMouseMove(e, childIndex)}
      onMouseLeave={() => handleChildMouseLeave(childIndex)}
    >
      {renderDesignComponent({
        component: child,
        selectedComponentId,
        pageBuilderMode,
        setSelectedComponent,
        updateComponent,
        removeComponent,
        addComponent,
        duplicateComponent
      })}
    </div>
  ))

  return (
    <div {...componentProps}>
      {componentControls}

      <RowComponent
        componentId={component.id}
        attributes={component.attributes}
        setSelectedComponent={setSelectedComponent}
        updateComponent={updateComponent}
        removeComponent={removeComponent}
        addComponent={addComponent}
        duplicateComponent={duplicateComponent}
      >
        {hasChildren ? intersperseAndAppend(children, null).map((item, index) =>
          item === null ? (
            <Divider
              key={`divider-${index}`}
              orientation="vertical"
              onAddComponent={handleAddAtIndex}
              index={index}
              isVisible={visibleDividers.has(index)}
            />
          ) : <React.Fragment key={index}>{item}</React.Fragment>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground flex-1">
            <ComponentPopover onSelect={(type) => addComponent({ type, parentId: component.id, index: 0 })}>
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
  selectedComponentId,
  pageBuilderMode,
  setSelectedComponent,
  updateComponent,
  removeComponent,
  addComponent,
  duplicateComponent,
}: ComponentWrapperProps<"column">) => {
  const [visibleDividers, setVisibleDividers] = React.useState<Set<number>>(new Set())
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const showControls = selectedComponentId === component.id

  const componentProps = {
    className: cn(
      "relative border border-transparent transition-all",
      showControls && "border-primary",
      "hover:border-gray-300",
    ),
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation()
      setSelectedComponent(component.id)
    },
  }

  const componentControls = showControls && ComponentControls({
    component,
    updateComponent,
    duplicateComponent,
    removeComponent,
  })

  // Handle adding component at specific index
  const handleAddAtIndex = (type: ComponentType, dividerIndex: number) => {
    const childIndex = Math.floor(dividerIndex / 2)
    const newComponent = createDesignComponent(type, generateId())
    addComponent({ type: newComponent.tag, parentId: component.id, index: childIndex })
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

  const componentData = getComponentInfo(component.tag)
  const ColumnComponent = componentData.Component

  const children = component.children.map(<Tag extends ComponentType>(child: DesignComponent<Tag>, childIndex: number) => (
    <div
      key={child.id}
      className="relative"
      onMouseMove={(e) => handleChildMouseMove(e, childIndex)}
      onMouseLeave={() => handleChildMouseLeave(childIndex)}
    >
      {renderDesignComponent({
        component: child,
        selectedComponentId,
        pageBuilderMode,
        setSelectedComponent,
        updateComponent,
        removeComponent,
        addComponent,
        duplicateComponent,
      })}
    </div>
  ))
  return (
    <div {...componentProps}>
      {componentControls}

      <ColumnComponent
        componentId={component.id}
        attributes={component.attributes}
        setSelectedComponent={setSelectedComponent}
        updateComponent={updateComponent}
        removeComponent={removeComponent}
        addComponent={addComponent}
        duplicateComponent={duplicateComponent}
      >
        {hasChildren ? intersperseAndAppend(children, null,).map((item, index) =>
          item === null ? (
            <Divider
              key={`divider-${index}`}
              orientation="horizontal"
              onAddComponent={handleAddAtIndex}
              index={index}
              isVisible={visibleDividers.has(index)}
            />) : <React.Fragment key={index}>{item}</React.Fragment>
        ) : (
          <div className="flex items-center justify-center h-full w-full text-muted-foreground">
            <ComponentPopover onSelect={(type) => addComponent({ type, parentId: component.id, index: 0 })}>
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

export function getWrapperComponent<Tag extends ComponentType>(tag: Tag): React.FC<ComponentWrapperProps<Tag>> {
  switch (tag) {
    case "row":
      return RowWrapper as React.FC<ComponentWrapperProps<Tag>>
    case "column":
      return ColumnWrapper as React.FC<ComponentWrapperProps<Tag>>
    default:
      return GenericDesignComponentWrapper as unknown as React.FC<ComponentWrapperProps<Tag>>
  }
}

// Helper function to render a design component
export function renderDesignComponent<Tag extends ComponentType>({
  pageBuilderMode,
  component,
  selectedComponentId,
  setSelectedComponent,
  updateComponent,
  removeComponent,
  addComponent,
  duplicateComponent,
}: ComponentWrapperProps<Tag>): ReactNode {
  const WrapperComponent = getWrapperComponent(component.tag)
  const Component = componentInfo[component.tag].Component
  const props = {
    pageBuilderMode,
    component,
    selectedComponentId,
    setSelectedComponent,
    updateComponent,
    removeComponent,
    addComponent,
    duplicateComponent,
  }

  const childrenToRender = component.children.map((child) => (
    <React.Fragment key={child.id}>
      {renderDesignComponent({ ...props, component: child, } as ComponentWrapperProps<typeof child.tag>)}
    </React.Fragment>
  ))

  return (
    pageBuilderMode === "edit" ? (
      <WrapperComponent {...props as ComponentWrapperProps<Tag>} >
        {childrenToRender}
      </WrapperComponent>
    ) : (
      <Component
        componentId={component.id}
        attributes={component.attributes}
        setSelectedComponent={setSelectedComponent}
        updateComponent={updateComponent}
        removeComponent={removeComponent}
        addComponent={addComponent}
        duplicateComponent={duplicateComponent}
      >
        {childrenToRender}
      </Component>
    )
  )
}
