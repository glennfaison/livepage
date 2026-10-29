import { ReplaceWithPopover } from "../replace-with-popover";
import { SettingsPopover } from "../settings-popover";
import { Button } from "@/client/components/ui/button";
import { cn } from "@/client/lib/utils";
import { Copy, Move, Replace, SettingsIcon, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { EditModeProps } from "@/client/features/types";
import { useComponentOperationsContext } from "../component-operations-context";
import { getComponentInfo } from "../../registry-store";
import { editorChromeButtonClassName, editorChromeSurfaceClassName, OPEN_COMPONENT_SETTINGS_EVENT } from "../shared/editor-chrome";
import { getAccessibilityAttributes } from "../../primitives";
import { useDragDrop } from "../drag-drop-context";
import { EditorOverlay } from "../editor-overlay";
import { useElementBox } from "../shared/use-element-box";

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
  const { duplicateComponent, removeComponent, replaceComponent } = useComponentOperationsContext()
  const { startDrag, endDrag } = useDragDrop()

  const handleReplace = useCallback((newType: string) => {
    replaceComponent(component.attributes.id, newType);
  }, [component.attributes.id, replaceComponent])

  const dragRef = useRef<{ startX: number; startY: number; hasMoved: boolean } | null>(null)

  const handleDragStart = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", component.attributes.id)
    dragRef.current = { startX: e.clientX, startY: e.clientY, hasMoved: false }
    startDrag(component.attributes.id, component.tag)
  }, [component.attributes.id, component.tag, startDrag])

  const handleDragEnd = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    endDrag()
    dragRef.current = null
  }, [endDrag])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }, [])

  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    const openSettings = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail
      if (detail === component.attributes.id) {
        setSettingsOpen(true)
      }
    }
    window.addEventListener(OPEN_COMPONENT_SETTINGS_EVENT, openSettings)
    return () => window.removeEventListener(OPEN_COMPONENT_SETTINGS_EVENT, openSettings)
  }, [component.attributes.id])

  return (
    // Sit above the component's top edge so the controls never cover its content.
    // The selection outline extends 4px (2px offset + 2px width) past the component, so
    // `-right-1` lines the toolbar up with the outline's right edge and `mb-2` clears it.
    <div className="pointer-events-auto absolute -right-1 bottom-full z-30 mb-2 flex flex-col items-end">
      <AncestorTags {...props} />
      {/* Empty title: stop the wrapper's long component tooltip showing while over the toolbar. */}
      <div className={cn("flex gap-1 p-1", editorChromeSurfaceClassName)} data-testid="editor-controls" title="">
        <span className="flex items-center px-2 text-xs font-medium text-popover-foreground">{label}</span>
        <SettingsPopover component={component} open={settingsOpen} onOpenChange={setSettingsOpen}>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-6 w-6 cursor-pointer", editorChromeButtonClassName)}
            aria-label="Settings"
            title="Settings"
            data-testid="component-settings-trigger"
            data-settings-trigger={component.attributes.id}
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
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <Move className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function withEditorControls(WrappedComponent: React.ComponentType<EditModeProps>) {
  return function ComponentWithEditorControls(props: EditModeProps) {
    const editMode = props.pageBuilderMode === "edit"
    const showControls = editMode && props.selectedComponentId === props.component.attributes.id
    const { setSelectedComponent } = useComponentOperationsContext()
    const { onMouseMove, onMouseLeave, onDragOver, onDragLeave } = props
    const [hovered, setHovered] = useState(false)

    const metadata = getComponentInfo(props.component.tag)
    const accessibilityAttrs = getAccessibilityAttributes(props.component, metadata)

    const selectComponent = useCallback((e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation()
      setSelectedComponent(props.component.attributes.id)
    }, [props.component.attributes.id, setSelectedComponent])

    // The wrapper has no box (`display: contents`), so the component inside it is the flex or
    // grid item of its parent, exactly as in preview. Chrome is drawn by EditorOverlay from the
    // component's own rectangle (ADR 0016). `childClassName` is applied by the component itself.
    const wrapperRef = useRef<HTMLDivElement>(null)
    const getComponentElement = useCallback(() => wrapperRef.current?.firstElementChild, [])
    const box = useElementBox(getComponentElement, editMode && (hovered || showControls))

    return (
      <div
        ref={wrapperRef}
        style={{ display: "contents" }}
        onClick={selectComponent}
        onMouseEnter={() => setHovered(true)}
        onMouseMove={onMouseMove}
        onMouseLeave={(e) => {
          setHovered(false)
          onMouseLeave?.(e)
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        {...accessibilityAttrs}
        data-component-id={props.component.attributes.id}
        data-selected={showControls ? "true" : "false"}
        aria-selected={showControls}
      >
        <WrappedComponent {...props} />
        {editMode && box && (
          <EditorOverlay box={box} selected={showControls}>
            {showControls && <EditorControls {...props} />}
          </EditorOverlay>
        )}
      </div>
    )
  }
}
