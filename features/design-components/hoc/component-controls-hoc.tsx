import { ReplaceWithPopover } from "@/components/page-builder/replace-with-popover";
import { SettingsPopover } from "@/components/page-builder/settings-popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Copy, Move, Replace, SettingsIcon, Trash2 } from "lucide-react";
import { useCallback } from "react";
import { getComponentInfo } from "..";
import type { ComponentProps, ComponentTag, DesignComponent } from "../types";
import { useComponentOperationsContext } from "@/lib/component-operations-context";
import React from "react";

function AncestorTags(props: ComponentProps<ComponentTag>) {
  const { setSelectedComponent } = useComponentOperationsContext()
  const ancestors = props.selectedComponentAncestors.filter((component) => {
    return component.tag !== "page"
  }).toReversed?.() as DesignComponent<ComponentTag>[]

  const selectAncestor = React.useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>, componentId: string) => {
    e.stopPropagation()
    setSelectedComponent(componentId)
  }, [setSelectedComponent])

  return (
    <div className="absolute bottom-[100%] right-0 flex flex-col items-end">
      {ancestors.map((component, idx) => (
        <div key={component.attributes.id}
          className={cn(
            "relative flex bg-background border p-1 px-2 shadow-sm cursor-pointer text-right justify-end text-xs opacity-95",
          )}
          style={{ width: `${100 + 10 * idx}%` }}
          onClick={(e) => selectAncestor(e, component.attributes.id)}
        >
          {getComponentInfo(component.tag).label}
        </div>
      ))}
    </div>
  )
}

function ComponentControls<Tag extends ComponentTag>(props: ComponentProps<Tag>) {
  const { component } = props
  const { label } = getComponentInfo(component.tag)
  const { duplicateComponent, removeComponent, replaceComponent, } = useComponentOperationsContext()

  const handleReplace = useCallback((newType: ComponentTag) => {
    replaceComponent(component.attributes.id, newType);
  }, [component.attributes.id, replaceComponent])

  return (
    <div className="absolute -top-8 right-0">
      <AncestorTags {...props} />
      <div className="flex gap-1 bg-background border p-1 shadow-sm">
        <span className="text-xs font-medium px-2 flex items-center">{label}</span>
        <SettingsPopover component={component}>
          <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <SettingsIcon className="h-4 w-4" />
          </Button>
        </SettingsPopover>
        <ReplaceWithPopover currentComponent={component} onReplace={handleReplace}>
          <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <Replace className="h-4 w-4" />
          </Button>
        </ReplaceWithPopover>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            duplicateComponent?.(component.attributes.id)
          }}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            removeComponent(component.attributes.id)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 cursor-grab">
          <Move className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function withEditorControls<Tag extends ComponentTag>(
  WrappedComponent: React.ComponentType<ComponentProps<Tag>>
) {
  return function ComponentWithControls(props: ComponentProps<Tag>) {
    const showControls = props.selectedComponentId === props.component.attributes.id
    const { setSelectedComponent } = useComponentOperationsContext()

    const selectComponent = useCallback((e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation()
      setSelectedComponent(props.component.attributes.id)
    }, [props.component.attributes.id, setSelectedComponent])

    return (
      <div onClick={selectComponent}
        className={cn(
          "relative border border-transparent transition-all",
          showControls && "border-primary",
          "hover:border-gray-300",
        )}
      >
        {showControls && <ComponentControls {...props} />}
        <WrappedComponent {...props} />
      </div>
    )
  }
}