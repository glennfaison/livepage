"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, X, RotateCcw, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

export interface HistoryEntry {
  id: string
  action: string
  timestamp: Date
  pageState: any
}

interface HistoryPopoverProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  history: HistoryEntry[]
  currentHistoryIndex: number
  onSelectHistory: (index: number) => void
  onAccept: () => void
  onDiscard: () => void
  previewIndex: number | null
  children: React.ReactNode
}

export const HistoryPopover: React.FC<HistoryPopoverProps> = ({
  isOpen,
  onOpenChange,
  history,
  currentHistoryIndex,
  onSelectHistory,
  onAccept,
  onDiscard,
  previewIndex,
  children,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isPositioned, setIsPositioned] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    } else {
      return formatTime(date)
    }
  }

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

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }
  }

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
  }, [isDragging, dragOffset])

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className={cn("w-80 p-0", isPositioned && "fixed z-50", isDragging && "cursor-grabbing")}
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
          {/* Header */}
          <div
            className={cn(
              "bg-foreground text-background p-4 rounded-t-lg flex items-center justify-between cursor-grab active:cursor-grabbing",
              isDragging && "cursor-grabbing",
            )}
            onMouseDown={handleMouseDown}
          >
            <h2 className="text-lg font-semibold">History</h2>
            <GripVertical className="h-4 w-4 opacity-60" />
          </div>

          {/* History List */}
          <div className="max-h-[400px] overflow-y-auto">
            {history.map((entry, index) => {
              const isSelected = previewIndex === index
              const isCurrent = index === currentHistoryIndex
              const isLatest = index === history.length - 1

              return (
                <div
                  key={entry.id}
                  className={cn(
                    "flex items-center justify-between p-3 cursor-pointer hover:bg-muted border-b border-border",
                    isSelected && "bg-muted border-border",
                    isCurrent && !isSelected && "bg-muted/50",
                  )}
                  onClick={() => onSelectHistory(index)}
                >
                  <div className="flex-1">
                    <div
                      className={cn(
                        "font-medium text-sm",
                        isSelected && "text-foreground",
                        !isSelected && "text-foreground",
                      )}
                    >
                      {entry.action}
                    </div>
                    <div className={cn("text-xs", "text-muted-foreground")}>
                      {isLatest ? "now" : getRelativeTime(entry.timestamp)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <div className="bg-foreground text-background rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    {!isSelected && (
                      <div className="text-muted-foreground">
                        <RotateCcw className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer Buttons */}
          <div className="flex">
            <Button
              variant="ghost"
              className="flex-1 rounded-none rounded-bl-lg bg-muted hover:bg-muted/80 text-foreground h-12"
              onClick={onDiscard}
            >
              <X className="h-4 w-4 mr-2" />
              Discard
            </Button>
            <Button
              variant="ghost"
              className="flex-1 rounded-none rounded-br-lg bg-foreground hover:bg-foreground/90 text-background h-12"
              onClick={onAccept}
            >
              <Check className="h-4 w-4 mr-2" />
              Accept
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
