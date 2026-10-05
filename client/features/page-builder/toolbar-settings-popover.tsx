"use client"

import { Button } from "@/client/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/client/components/ui/popover"
import { cn } from "@/client/lib/utils"
import { GripVertical, Keyboard, LayoutDashboard, Palette, Save, Settings } from "lucide-react"
import type React from "react"
import { useCallback, useRef, useState } from "react"
import type { AppNode } from "@/client/features/types"
import { selectCurrentPage } from "@/client/features/app-state"

type ToolbarSettingsPopoverProps = Readonly<{
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  toolbarLayout: "horizontal" | "vertical"
  onToolbarLayoutChange: (layout: "horizontal" | "vertical") => void
  pageTitle: string
  onPageTitleChange: (title: string) => void
  children: React.ReactNode
}>

export const ToolbarSettingsPopover: React.FC<ToolbarSettingsPopoverProps> = ({
  isOpen,
  onOpenChange,
  toolbarLayout,
  onToolbarLayoutChange,
  pageTitle,
  onPageTitleChange,
  children,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isPositioned, setIsPositioned] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }
  }, [dragOffset.x, dragOffset.y, isDragging])

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className={cn("w-72 p-0", isPositioned && "fixed z-50", isDragging && "cursor-grabbing")}
        align="start"
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
        <div ref={popoverRef} className="bg-background border rounded-lg shadow-lg">
          <div
            className={cn(
              "bg-foreground text-background p-4 rounded-t-lg flex items-center justify-between cursor-grab active:cursor-grabbing",
              isDragging && "cursor-grabbing",
            )}
            onMouseDown={handleMouseDown}
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </h2>
            <GripVertical className="h-4 w-4 opacity-60" />
          </div>

          <div className="p-4 space-y-4">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Page</h3>
              <div className="space-y-2">
                <label htmlFor="page-title" className="text-sm font-medium">
                  Page Title
                </label>
                <input
                  id="page-title"
                  type="text"
                  value={pageTitle}
                  onChange={(e) => onPageTitleChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter page title"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Toolbar</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium">Layout</label>
                <div className="flex gap-2">
                  <Button
                    variant={toolbarLayout === "horizontal" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => onToolbarLayoutChange("horizontal")}
                  >
                    <LayoutDashboard className="h-3 w-3 mr-1" />
                    Horizontal
                  </Button>
                  <Button
                    variant={toolbarLayout === "vertical" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => onToolbarLayoutChange("vertical")}
                  >
                    <GripVertical className="h-3 w-3 mr-1" />
                    Vertical
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shortcuts</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Keyboard className="h-3 w-3 shrink-0" />
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">⌘K</kbd>
                  <span>Command Palette</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Keyboard className="h-3 w-3 shrink-0" />
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">⌘S</kbd>
                  <span>Save Page</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Keyboard className="h-3 w-3 shrink-0" />
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">⌘Z</kbd>
                  <span>Undo</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Keyboard className="h-3 w-3 shrink-0" />
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">⌘⇧Z</kbd>
                  <span>Redo</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</h3>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => onOpenChange(false)}>
                  <Palette className="h-4 w-4" />
                  Browse Templates
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => onOpenChange(false)}>
                  <Save className="h-4 w-4" />
                  Export Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}