import { cn } from "@/client/lib/utils"
import { CONTRAST_DARK, CONTRAST_LIGHT, getContrastColorForBackground, parseCssColor } from "./shared/contrast-color"
import { Plus } from "lucide-react"
import React from "react"
import { Button } from "@/client/components/ui/button"
import { ComponentSelectorPopover } from "./component-selector-popover"
import type { AppNodeTag } from "@/client/features/types"

const MAX_ANCESTOR_DEPTH = 12

export const measureBackgroundUnder = (el: HTMLElement | null): string | null => {
  if (typeof window === "undefined" || !el) return null
  let node: HTMLElement | null = el.parentElement
  for (let depth = 0; node && depth < MAX_ANCESTOR_DEPTH; depth++) {
    const bg = window.getComputedStyle(node).backgroundColor
    if (parseCssColor(bg)) return bg
    node = node.parentElement
  }
  return null
}

export const useDividerContrastColor = (ref: React.RefObject<HTMLElement | null>) => {
  const [color, setColor] = React.useState(CONTRAST_DARK)
  React.useEffect(() => {
    const measure = () => setColor(getContrastColorForBackground(measureBackgroundUnder(ref.current)))
    measure()
    const frame = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(frame)
  }, [ref])
  return color
}

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

  const barRef = React.useRef<HTMLDivElement>(null)
  const color = useDividerContrastColor(barRef)
  const iconColor = color === CONTRAST_LIGHT ? CONTRAST_DARK : CONTRAST_LIGHT

  const handleAddComponent = (type: AppNodeTag) => {
    onAddComponent(type, index)
    setPopoverOpen(false)
  }

  return (
    <div
      ref={barRef}
      style={{ backgroundColor: color }}
      className={cn(
        "relative flex items-center justify-center transition-all duration-200 group cursor-pointer",
        isVisible ? "opacity-100" : "invisible opacity-30 hover:visible",
        orientation === "horizontal" ? "flex-row h-2 w-full" : "flex-col w-2 self-stretch",
      )}
    >
      <ComponentSelectorPopover onSelect={handleAddComponent} parentTag={parentTag}>
        <Button
          variant="ghost"
          size="icon"
          style={{ backgroundColor: color, color: iconColor }}
          className="relative z-20 size-7 rounded-full transition-transform hover:scale-110 hover:bg-inherit"
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
