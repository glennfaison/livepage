import { cn } from "@/client/lib/utils"
import { editorChromeButtonClassName, editorChromeSurfaceClassName } from "./shared/editor-chrome"
import { Plus } from "lucide-react"
import React from "react"
import { Button } from "@/client/components/ui/button"
import { ComponentSelectorPopover } from "./component-selector-popover"
import type { AppNodeTag } from "@/client/features/types"

export const Divider = ({
  orientation,
  parentTag,
  onAddComponent,
  index,
  isVisible,
}: Readonly<{
  orientation: "horizontal" | "vertical"
  parentTag: AppNodeTag
  onAddComponent: (type: AppNodeTag, index: number) => void
  index: number
  isVisible: boolean
}>) => {
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  isVisible = isVisible || popoverOpen

  const handleAddComponent = (type: AppNodeTag) => {
    onAddComponent(type, index)
    setPopoverOpen(false)
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center transition-all duration-200 group",
        "cursor-pointer bg-transparent hover:bg-gray-400 hover:visible",
        isVisible ? "bg-gray-400" : "invisible",
        orientation === "horizontal" ? "flex-row h-2 w-full" : "flex-col w-2 self-stretch",
        isVisible ? "bg-primary/45" : "bg-transparent hover:bg-primary/30",
      )}
    >
      <ComponentSelectorPopover onSelect={handleAddComponent} parentTag={parentTag}>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative z-20 size-7 rounded-full transition-transform hover:scale-110",
            editorChromeSurfaceClassName,
            editorChromeButtonClassName,
          )}
          onClick={(e) => {
            e.stopPropagation()
            setPopoverOpen(true)
          }}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </ComponentSelectorPopover>
    </div>
  )
}


type DividerAxis = "v" | "h"

const dividerKey = (axis: DividerAxis, index: number) => `${axis}${index}`

/**
 * Divider visibility is keyed per edge. Show and hide each bump a generation so a
 * hide that already queued a state update cannot clobber a later show (the race
 * that left insertion dividers stuck visible or stuck invisible).
 */
export const useDividerVisibility = () => {
  const [visibleVerticalDividers, setVisibleVerticalDividers] = React.useState<Set<number>>(() => new Set())
  const [visibleHorizontalDividers, setVisibleHorizontalDividers] = React.useState<Set<number>>(() => new Set())
  const generationRef = React.useRef<Record<string, number>>({})
  const timeoutRef = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const clearTimer = React.useCallback((key: string) => {
    const pending = timeoutRef.current[key]
    if (pending) {
      clearTimeout(pending)
      delete timeoutRef.current[key]
    }
  }, [])

  const bump = React.useCallback((key: string) => {
    clearTimer(key)
    const next = (generationRef.current[key] ?? 0) + 1
    generationRef.current[key] = next
    return next
  }, [clearTimer])

  const setVisible = React.useCallback((axis: DividerAxis, index: number, visible: boolean, generation: number) => {
    const key = dividerKey(axis, index)
    const setter = axis === "v" ? setVisibleVerticalDividers : setVisibleHorizontalDividers
    setter((prev) => {
      if (generationRef.current[key] !== generation) return prev
      if (prev.has(index) === visible) return prev
      const next = new Set(prev)
      if (visible) next.add(index)
      else next.delete(index)
      return next
    })
  }, [])

  const showDivider = React.useCallback((axis: DividerAxis, index: number) => {
    const generation = bump(dividerKey(axis, index))
    setVisible(axis, index, true, generation)
  }, [bump, setVisible])

  const hideDividerNow = React.useCallback((axis: DividerAxis, index: number) => {
    const generation = bump(dividerKey(axis, index))
    setVisible(axis, index, false, generation)
  }, [bump, setVisible])

  React.useEffect(() => {
    const timeouts = timeoutRef.current
    return () => {
      for (const pending of Object.values(timeouts)) clearTimeout(pending)
    }
  }, [])

  const syncEdge = (axis: DividerAxis, index: number, near: boolean) => {
    if (near) showDivider(axis, index)
    else hideDividerNow(axis, index)
  }

  const handleChildMouseMove = (e: React.MouseEvent, childIndex: number) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    syncEdge("v", childIndex * 2, x < rect.width * 0.3)
    syncEdge("v", (childIndex + 1) * 2, x > rect.width * 0.7)
    syncEdge("h", childIndex * 2, y < rect.height * 0.3)
    syncEdge("h", (childIndex + 1) * 2, y > rect.height * 0.7)
  }

  const handleChildMouseLeave = (childIndex: number) => {
    hideDividerNow("v", childIndex * 2)
    hideDividerNow("v", (childIndex + 1) * 2)
    hideDividerNow("h", childIndex * 2)
    hideDividerNow("h", (childIndex + 1) * 2)
  }

  return {
    visibleVerticalDividers,
    visibleHorizontalDividers,
    handleChildMouseMove,
    handleChildMouseLeave,
  }
}
