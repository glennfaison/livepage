import { ReplaceWithPopover } from "../replace-with-popover";
import { SettingsPopover } from "../settings-popover";
import { Button } from "@/client/components/ui/button";
import { cn } from "@/client/lib/utils";
import { Copy, Move, Replace, SettingsIcon, Trash2 } from "lucide-react";
import React, { useCallback } from "react";
import type { EditModeProps, Metadata } from "@/client/features/types";
import { useComponentOperationsContext } from "../component-operations-context";
import { getComponentInfo } from "../../registry-store";
import { editorChromeButtonClassName, editorChromeSurfaceClassName } from "../shared/editor-chrome";
import { getAccessibilityAttributes } from "../../primitives";

function AncestorTags(props: EditModeProps) {
  const { setSelectedComponent } = useComponentOperationsContext()
  const ancestors = props.selectedComponentAncestors.filter((component) => {
    return component.tag !== "page"
  }).toReversed?.() as EditModeProps["component"][]
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const timeout = timeoutRef.current;
    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [])

  const selectAncestor = React.useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>, componentId: string) => {
    e.stopPropagation()
    setSelectedComponent(componentId)

    const targetEl = document.getElementById(componentId)
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })

      // Add a class temporarily to animate focus
      targetEl.classList.add('ring', 'ring-blue-500')
      timeoutRef.current = setTimeout(() => {
        targetEl.classList.remove('ring', 'ring-blue-500')
      }, 1000)
    }
  }, [setSelectedComponent])

  return (
    <div className="absolute bottom-[100%] right-0 flex flex-col items-end">
      {ancestors.map((component, idx) => {
        return (
          <div key={component.attributes.id}
            className={cn(
              "relative flex cursor-pointer justify-end p-1 px-2 text-right text-xs",
              editorChromeSurfaceClassName,
              "text-muted-foreground",
            )}
            style={{ width: `${100 + 10 * idx}%` }}
            onClick={(e) => selectAncestor(e, component.attributes.id)}
          >
            {getComponentInfo(component.tag).label}
          </div>
        )
      })}
    </div>
  )
}

function EditorControls(props: EditModeProps) {
  const { component } = props
  const { label } = getComponentInfo(component.tag)
  const { duplicateComponent, removeComponent, replaceComponent, } = useComponentOperationsContext()

  const handleReplace = useCallback((newType: string) => {
    replaceComponent(component.attributes.id, newType);
  }, [component.attributes.id, replaceComponent])

  return (
    <div className="absolute -top-8 right-0">
      <AncestorTags {...props} />
      <div className={cn("flex gap-1 p-1", editorChromeSurfaceClassName)}>
        <span className="flex items-center px-2 text-xs font-medium text-popover-foreground">{label}</span>
        <SettingsPopover component={component}>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-6 w-6 cursor-pointer", editorChromeButtonClassName)}
            aria-label="Settings"
            title="Settings"
            onClick={(e) => e.stopPropagation()}
          >
            <SettingsIcon className="h-4 w-4" />
          </Button>
        </SettingsPopover>
        <ReplaceWithPopover currentComponent={component} parentTag={props.parentTag} onReplace={handleReplace}>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-6 w-6 cursor-pointer", editorChromeButtonClassName)}
            aria-label="Replace"
            title="Replace"
            onClick={(e) => e.stopPropagation()}
          >
            <Replace className="h-4 w-4" />
          </Button>
        </ReplaceWithPopover>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-6 w-6 cursor-pointer", editorChromeButtonClassName)}
          aria-label="Duplicate"
          title="Duplicate"
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
          className={cn("h-6 w-6 cursor-pointer", editorChromeButtonClassName)}
          aria-label="Delete"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation()
            removeComponent(component.attributes.id)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-6 w-6 cursor-grab", editorChromeButtonClassName)}
          aria-label="Move"
          title="Move"
        >
          <Move className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function withEditorControls(WrappedComponent: React.ComponentType<EditModeProps>) {
  return function ComponentWithEditorControls(props: EditModeProps) {
    const showControls = props.pageBuilderMode === "edit" &&
      props.selectedComponentId === props.component.attributes.id
    const { setSelectedComponent } = useComponentOperationsContext()
    const { childClassName, onMouseMove, onMouseLeave } = props

    const metadata = getComponentInfo(props.component.tag)
    const accessibilityAttrs = getAccessibilityAttributes(props.component, metadata)

    const selectComponent = useCallback((e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation()
      setSelectedComponent(props.component.attributes.id)
    }, [props.component.attributes.id, setSelectedComponent])

    return (
      <div
        onClick={selectComponent}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className={cn(
          "block relative border border-transparent transition-all",
          showControls && "border-primary",
          "hover:border-gray-300",
          childClassName,
        )}
        {...accessibilityAttrs}
        data-component-id={props.component.attributes.id}
      >
        {showControls && <EditorControls {...props} />}
        <WrappedComponent {...props} />
      </div>
    )
  }
}