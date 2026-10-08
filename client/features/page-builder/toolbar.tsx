"use client"

import { HistoryPopover } from "@/client/features/page-builder/history-popover"
import { ToolbarSettingsPopover } from "@/client/features/page-builder/toolbar-settings-popover"
import { Button } from "@/client/components/ui/button"
import type { PageBuilderMode } from "@/client/features/app-state"
import { cn } from "@/client/lib/utils"
import { Bot, Command, GripVertical, History, Maximize, Minimize, Redo, RotateCw, Save, Settings, Undo, X } from "lucide-react"
import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import type { HistoryEntry } from "@/client/features/types"
import type { AppAction, AppNode } from "@/client/features/types"
import { selectCurrentPage } from "@/client/features/app-state"
import { formatShortcut, useHistoryShortcut, useSaveShortcut, useUndoShortcut, useRedoShortcut } from "@/client/features/page-builder/keyboard-shortcuts"

const COMPACT_TOOLBAR_BREAKPOINT = 640
const TOOLBAR_VIEWPORT_MARGIN = 8

/**
 * Asserts that the floating toolbar's action buttons are balanced around the
 * minimize/maximize pivot. `L` is the button count to the left of the pivot,
 * `R` the count to the right; the difference must be -1, 0, or 1. Any other
 * value means a button was added or removed without rebalancing the row.
 */
export function assertToolbarButtonBalance(leftCount: number, rightCount: number): void {
  const difference = leftCount - rightCount
  if (difference < -1 || difference > 1) {
    throw new Error(
      `Toolbar button imbalance: ${leftCount} buttons left of the minimize/maximize pivot, ${rightCount} right (L - R = ${difference}). Expected -1, 0, or 1.`,
    )
  }
}

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
  onOpenCommandPalette?: () => void
  /** Optional: renders an AI Assistant trigger button when provided and prompt assist is enabled. */
  onOpenAIAssistant?: () => void
  /** Page component for settings popover */
  pageComponent?: AppNode
  /** Full component tree for export validation */
  componentTree: ReadonlyArray<AppNode>
  /** Callback to update page title */
  onPageTitleChange?: (title: string) => void
  /** Undo callback */
  onUndo?: () => void
  /** Redo callback */
  onRedo?: () => void
  /** App dispatch for settings */
  dispatch?: React.Dispatch<AppAction>
  /** Whether AI Assistant is enabled */
  promptAssistEnabled?: boolean
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
  onOpenAIAssistant,
  pageComponent,
  componentTree,
  onPageTitleChange,
  onUndo,
  onRedo,
  dispatch,
  promptAssistEnabled,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [historyPopoverOpen, setHistoryPopoverOpen] = useState(false)
  const [settingsPopoverOpen, setSettingsPopoverOpen] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [toolbarLayout, setToolbarLayout] = useState<"horizontal" | "vertical">("vertical")
  const isDraggingRef = useRef(isDragging)
  const dragOffsetRef = useRef(dragOffset)

  const pageTitle = pageComponent?.attributes?.title ?? ""
  const currentPage = pageComponent ?? componentTree[0]
  const canUndo = currentHistoryIndex > 0
  const canRedo = currentHistoryIndex < history.length - 1

  // Keyboard shortcuts
  useSaveShortcut(savePage)
  useHistoryShortcut(() => setHistoryPopoverOpen(true))
  useUndoShortcut(() => onUndo?.(), canUndo)
  useRedoShortcut(() => onRedo?.(), canRedo)

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
  // Skip in preview mode: the toolbar renders null but the effect would still run
  // and trigger state updates on resize, causing "Maximum update depth exceeded".
  useEffect(() => {
    if (pageBuilderMode === "preview") return
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
  }, [dockPosition, setToolbarMinimized, pageBuilderMode])

  const handleMouseDown = (e: React.MouseEvent) => {
    const gripElement = e.currentTarget as HTMLElement
    const rect = gripElement.getBoundingClientRect()
    const gripCenterX = rect.left + rect.width / 2
    const gripCenterY = rect.top + rect.height / 2

    const offset = {
      x: e.clientX - gripCenterX,
      y: e.clientY - gripCenterY,
    }
    setDragOffset(offset)
    dragOffsetRef.current = offset
    setIsDragging(true)
    isDraggingRef.current = true
  }

  useEffect(() => {
    if (pageBuilderMode === "preview") return

    const handleMove = (e: MouseEvent) => {
      if (isDraggingRef.current && toolbarRef.current) {
        const rect = toolbarRef.current.getBoundingClientRect()
        const offset = dragOffsetRef.current
        setPosition(clampToolbarCenter(
          e.clientX - offset.x,
          e.clientY - offset.y,
          rect.width,
          rect.height,
          window.innerWidth,
          window.innerHeight,
        ))
      }
    }

    const handleUp = () => {
      isDraggingRef.current = false
      setIsDragging(false)
    }

    document.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseup", handleUp)
    return () => {
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseup", handleUp)
    }
  }, [pageBuilderMode])

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
        <div className={cn("flex items-center gap-1", toolbarLayout === "vertical" ? "flex-col" : "flex-row")}>
          <div
            className="flex items-center justify-center h-full cursor-grab active:cursor-grabbing px-1"
            onMouseDown={handleMouseDown}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
          </div>

          {onOpenCommandPalette ? (
            <Button variant="outline" size="sm" onClick={onOpenCommandPalette} title="Command palette" className="shrink-0">
              <Command className="h-4 w-4" />
            </Button>
          ) : null}
          {onOpenAIAssistant && promptAssistEnabled ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAIAssistant}
              title="Open AI Assistant"
              className="shrink-0"
            >
              <Bot className="h-4 w-4" />
            </Button>
          ) : null}
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
            <Button variant="outline" size="sm" title="History" className="shrink-0">
              <History className="h-4 w-4" />
            </Button>
          </HistoryPopover>

          <Button variant="outline" size="sm" onClick={onUndo} disabled={!canUndo} title={`Undo (${formatShortcut("Z")})`} className="shrink-0" aria-label="Undo">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onRedo} disabled={!canRedo} title={`Redo (${formatShortcut("Z")})`} className="shrink-0" aria-label="Redo">
            <Redo className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm" onClick={() => setToolbarMinimized(true)} title="Minimize" className="shrink-0">
            <Minimize className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={savePage} title="Save" className="shrink-0">
            <Save className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDiscard} title="Discard" className="shrink-0">
            <X className="h-4 w-4" />
          </Button>

          <ToolbarSettingsPopover
            isOpen={settingsPopoverOpen}
            onOpenChange={setSettingsPopoverOpen}
            toolbarLayout={toolbarLayout}
            onToolbarLayoutChange={setToolbarLayout}
            pageTitle={pageTitle}
            onPageTitleChange={onPageTitleChange ?? (() => {})}
            pageComponent={currentPage}
            componentTree={componentTree}
            dispatch={dispatch ?? (() => {})}
            promptAssistEnabled={promptAssistEnabled ?? false}
          >
            <Button variant="outline" size="sm" title="Settings" className="shrink-0">
              <Settings className="h-4 w-4" />
            </Button>
          </ToolbarSettingsPopover>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setToolbarLayout(toolbarLayout === "horizontal" ? "vertical" : "horizontal")}
            title={`Switch to ${toolbarLayout === "horizontal" ? "vertical" : "horizontal"} layout`}
            className="shrink-0"
          >
            <RotateCw className="h-4 w-4" />
          </Button>

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

          <Button variant="outline" size="sm" onClick={onUndo} disabled={!canUndo} title={`Undo (${formatShortcut("Z")})`} className="shrink-0" aria-label="Undo">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onRedo} disabled={!canRedo} title={`Redo (${formatShortcut("Z")})`} className="shrink-0" aria-label="Redo">
            <Redo className="h-4 w-4" />
          </Button>

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
