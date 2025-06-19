"use client"

import { HistoryPopover } from "@/components/page-builder/history-popover"
import { Button } from "@/components/ui/button"
import type { PageBuilderMode } from "@/features/design-components/types"
import type { HistoryEntry } from "@/lib/store/types"
import { cn } from "@/lib/utils"
import { GripVertical, History, Maximize, Minimize, RotateCw, Save, Settings, X } from "lucide-react"
import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"

interface PageCraftToolbarProps {
  toolbarMinimized: boolean
  pageBuilderMode: PageBuilderMode
  history: HistoryEntry[]
  currentHistoryIndex: number
  historyPreviewIndex: number | null
  setToolbarMinimized: (minimized: boolean) => void
  savePage: () => void
  handleDiscard: () => void
  onSelectHistory: (index: number) => void
  onAcceptHistory: (index: number) => void
  onDiscardHistory: () => void
}

export const PageCraftToolbar: React.FC<PageCraftToolbarProps> = ({
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
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [historyPopoverOpen, setHistoryPopoverOpen] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [toolbarLayout, setToolbarLayout] = useState<"horizontal" | "vertical">("vertical")

  // Initialize position to right center
  useEffect(() => {
    const updatePosition = () => {
      if (typeof window !== "undefined") {
        setPosition({
          x: window.innerWidth - 80, // 80px from right edge
          y: window.innerHeight / 2, // Vertically centered
        })
      }
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    return () => window.removeEventListener("resize", updatePosition)
  }, [])

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
        // const toolbarRect = toolbarRef.current.getBoundingClientRect()
        // const toolbarCenterX = toolbarRect.left + toolbarRect.width / 2
        // const toolbarCenterY = toolbarRect.top + toolbarRect.height / 2

        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
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
        "fixed bg-background/50 backdrop-blur-sm shadow-lg border rounded-lg p-2 z-50 transition-all duration-300 select-none",
        toolbarMinimized && "p-1 w-auto",
        isDragging && "cursor-grabbing",
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
            <HistoryPopover
              isOpen={historyPopoverOpen}
              onOpenChange={setHistoryPopoverOpen}
              history={history}
              currentHistoryIndex={currentHistoryIndex}
              onSelectHistory={onSelectHistory}
              onAccept={onAcceptHistory}
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
        <div className="flex items-center gap-1">
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
