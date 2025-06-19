import { ReplaceWithPopover } from "@/components/page-builder/replace-with-popover";
import { SettingsPopover } from "@/components/page-builder/settings-popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Copy, Move, Replace, Settings, Trash2 } from "lucide-react";
import { useCallback } from "react";
import { getComponentInfo } from "..";
import type { ComponentProps, ComponentTag } from "../types";


function ComponentControls<Tag extends ComponentTag>(props: ComponentProps<Tag>) {
  const { duplicateComponent, removeComponent, replaceComponent, } = props
  const { component } = props
  const { label } = getComponentInfo(component.tag)

  const handleReplace = useCallback((newType: ComponentTag) => {
    replaceComponent(component.id, newType);
  }, [component.id, replaceComponent])

  return (
    <div className="absolute -top-8 right-0 flex gap-1 bg-background border rounded-t-md p-1 shadow-sm">
      <span className="text-xs font-medium px-2 flex items-center">{label}</span>
      <SettingsPopover
        component={component}
      >
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
          <Settings className="h-4 w-4" />
        </Button>
      </SettingsPopover>
      <ReplaceWithPopover currentComponent={component} onReplace={handleReplace}>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
          <Replace className="h-4 w-4" />
        </Button>
      </ReplaceWithPopover>
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

export function withEditorControls<Tag extends ComponentTag>(
  WrappedComponent: React.ComponentType<ComponentProps<Tag>>
) {
  return function ComponentWithControls(props: ComponentProps<Tag>) {
    const showControls = props.selectedComponentId === props.component.id
    const { setSelectedComponent } = props

    const selectComponent = useCallback((e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation()
      setSelectedComponent(props.component.id)
    }, [props.component.id, setSelectedComponent])

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