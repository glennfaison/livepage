"use client"

import { HistoryPopover } from "@/client/features/page-builder/history-popover"
import { Button } from "@/client/components/ui/button"
import type { PageBuilderMode } from "@/client/features/app-state"
import { cn } from "@/client/lib/utils"
import { Command, GripVertical, History, Maximize, Minimize, RotateCw, Save, Settings, X } from "lucide-react"
import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import type { HistoryEntry } from "@/client/features/types"

const COMPACT_TOOLBAR_BREAKPOINT = 640
const TOOLBAR_VIEWPORT_MARGIN = 8

export function clampToolbarCenter(
  x: number,
  y: number,
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  const halfWidth = Math.min(width, viewportWidth - TOOLBAR_VIEWPORT_MARGIN * 2) / 2
  const halfHeight = Math.min(height, viewportHeight - TOOLBAR_VIEWPORT_MARGIN * 2) / 2
  const minX = TOOLBAR_VIEWPORT_MARGIN + halfWidth
  const maxX = Math.max(minX, viewportWidth - TOOLBAR_VIEWPORT_MARGIN - halfWidth)
  const minY = TOOLBAR_VIEWPORT_MARGIN + halfHeight
  const maxY = Math.max(minY, viewportHeight - TOOLBAR_VIEWPORT_MARGIN - halfHeight)
  return {
    x: Math.min(Math.max(x, minX), maxX),
    y: Math.min(Math.max(y, minY), maxY),
  }
}

export const Toolbar: React.FC<Readonly<{
  toolbarMinimized: boolean
  setToolbarMinimized: (minimized: boolean) => void
  savePage: () => void
  handleDiscard: () => void
  pageBuilderMode: PageBuilderMode
  history: ReadonlyArray<HistoryEntry>
  currentHistoryIndex: number
  onSelectHistory: (index: number) => void
  onAcceptHistory: (index: number) => void
  onDiscardHistory: () => void
  historyPreviewIndex: number | null
  /** Optional: renders a command-palette trigger button when provided. */
  onOpenCommandPalette?: () => void
}>> = ({
  toolbarMinimized,
  setToolbarMinimized,
  savePage,
  handleDiscard,
  pageBuilderMode,
  history,
  currentHistoryIndex,
  onSelectHistory,
  onAcceptHistory,
  onDiscardHistory,
  historyPreviewIndex,
  onOpenCommandPalette,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [historyPopoverOpen, setHistoryPopoverOpen] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [toolbarLayout, setToolbarLayout] = useState<"horizontal" | "vertical">("vertical")
  const dockPosition = useCallback((preferred?: { x: number; y: number }) => {
    if (typeof window === "undefined") return
    const rect = toolbarRef.current?.getBoundingClientRect()
    const width = rect?.width ?? 48
    const height = rect?.height ?? 48
    const fallback = {
      x: window.innerWidth - TOOLBAR_VIEWPORT_MARGIN - width / 2,
      y: window.innerHeight / 2,
    }
    setPosition(clampToolbarCenter(
      preferred?.x ?? fallback.x,
      preferred?.y ?? fallback.y,
      width,
      height,
      window.innerWidth,
      window.innerHeight,
    ))
  }, [])

  // Keep the floating toolbar inside the viewport. Narrow screens start compact
  // so the expanded control strip cannot run off the right or bottom edge.
  useEffect(() => {
    if (window.innerWidth < COMPACT_TOOLBAR_BREAKPOINT) {
      setToolbarMinimized(true)
      setToolbarLayout("vertical")
    }
    dockPosition()
    const handleResize = () => {
      if (window.innerWidth < COMPACT_TOOLBAR_BREAKPOINT) setToolbarLayout("vertical")
      dockPosition()
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [dockPosition, setToolbarMinimized])

  const handleMouseDown = (e: React.MouseEvent) => {
    const gripElement = e.currentTarget as HTMLElement
    const rect = gripElement.getBoundingClientRect()
    const gripCenterX = rect.left + rect.width / 2
    const gripCenterY = rect.top + rect.height / 2

    setDragOffset({
      x: e.clientX - gripCenterX,
      y: e.clientY - gripCenterY,
    })
    setIsDragging(true)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && toolbarRef.current) {
        const rect = toolbarRef.current.getBoundingClientRect()
        setPosition(clampToolbarCenter(
          e.clientX - dragOffset.x,
          e.clientY - dragOffset.y,
          rect.width,
          rect.height,
          window.innerWidth,
          window.innerHeight,
        ))
      }
    },
    [isDragging, dragOffset.x, dragOffset.y],
  )

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragOffset, handleMouseMove])

  if (pageBuilderMode === "preview" as PageBuilderMode) return null

  return (
    <div
      ref={toolbarRef}
      className={cn(
        "fixed max-h-[calc(100dvh-1rem)] max-w-[calc(100vw-1rem)] overflow-auto bg-background/50 backdrop-blur-sm shadow-lg border rounded-lg p-2 z-50 select-none",
        toolbarMinimized && "p-1 w-auto",
        isDragging && "cursor-grabbing",
        !isDragging && "transition-all duration-300",
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {!toolbarMinimized ? (
        <div className={cn("flex items-center gap-2", toolbarLayout === "vertical" ? "flex-col" : "flex-row")}>
          <div
            className="flex items-center justify-center h-full cursor-grab active:cursor-grabbing px-1"
            onMouseDown={handleMouseDown}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
          </div>

          <div className={cn("flex items-center gap-2", toolbarLayout === "vertical" ? "flex-col" : "flex-row")}>
            {onOpenCommandPalette ? (
              <Button variant="outline" size="sm" onClick={onOpenCommandPalette} title="Command palette (⌘K)">
                <Command className="h-4 w-4" />
              </Button>
            ) : null}
            <HistoryPopover
              isOpen={historyPopoverOpen}
              onOpenChange={setHistoryPopoverOpen}
              history={history}
              currentHistoryIndex={currentHistoryIndex}
              onSelectHistory={onSelectHistory}
              onDiscard={onDiscardHistory}
              previewIndex={historyPreviewIndex}
            >
              <Button variant="outline" size="sm" title="History">
                <History className="h-4 w-4" />
              </Button>
            </HistoryPopover>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                /* Settings functionality */
              }}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setToolbarLayout(toolbarLayout === "horizontal" ? "vertical" : "horizontal")}
              title={`Switch to ${toolbarLayout === "horizontal" ? "vertical" : "horizontal"} layout`}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={() => setToolbarMinimized(true)} title="Minimize">
            <Minimize className="h-4 w-4" />
          </Button>

          <div className={cn("flex items-center gap-2", toolbarLayout === "vertical" ? "flex-col" : "flex-row")}>
            <Button variant="outline" size="sm" onClick={savePage} title="Save">
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDiscard} title="Discard">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div
            className="flex items-center justify-center h-full cursor-grab active:cursor-grabbing px-1"
            onMouseDown={handleMouseDown}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
          </div>
        </div>
      ) : (
        <div className={cn("flex items-center gap-1", toolbarLayout === "vertical" ? "flex-col" : "flex-row")}>
          <div
            className="flex items-center justify-center h-full cursor-grab active:cursor-grabbing px-1"
            onMouseDown={handleMouseDown}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setToolbarMinimized(false)}
            className="flex items-center gap-2"
            title="Maximize"
          >
            <Maximize className="h-4 w-4" />
          </Button>

          <div
            className="flex items-center justify-center h-full cursor-grab active:cursor-grabbing px-1"
            onMouseDown={handleMouseDown}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
          </div>
        </div>
      )}
    </div>
  )
}
