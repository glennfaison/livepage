"use client"

import { cn } from "@/client/lib/utils"
import { GripVertical } from "lucide-react"
import type React from "react"
import { useDraggablePanel } from "@/client/features/page-builder/use-draggable-panel"

type DraggablePanelProps = Readonly<{
  /** Content of the dark title bar, rendered to the right of the grip. */
  header: React.ReactNode
  /** Accessible name for the grip, e.g. "Drag settings panel". */
  dragLabel: string
  /** Space kept between the panel and the viewport edge while dragging. */
  viewportMargin: number
  className?: string
  children: React.ReactNode
}>

/**
 * A panel with a title bar and a grip that lets the user move it. It moves by
 * a translate offset relative to wherever its container placed it, so it works
 * inside a Radix popover without taking over the popover's positioning. Mount
 * it inside the popover content: closing unmounts it, which resets the offset.
 */
export const DraggablePanel: React.FC<DraggablePanelProps> = ({ header, dragLabel, viewportMargin, className, children }) => {
  const { panelRef, offset, isDragging, handleProps } = useDraggablePanel(viewportMargin)

  return (
    <div
      ref={panelRef}
      data-testid="draggable-panel"
      className={cn("flex flex-col overflow-hidden rounded-lg border bg-background shadow-lg", isDragging && "select-none", className)}
      style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
    >
      <div className="bg-foreground text-background p-4 rounded-t-lg flex items-center gap-2 shrink-0">
        <button
          type="button"
          aria-label={dragLabel}
          title="Drag to move (double-click to reset)"
          data-testid="draggable-panel-grip"
          className={cn(
            "-ml-2 shrink-0 touch-none rounded p-1 text-background/60 hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background",
            isDragging ? "cursor-grabbing" : "cursor-grab",
          )}
          {...handleProps}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        {header}
      </div>
      {children}
    </div>
  )
}
