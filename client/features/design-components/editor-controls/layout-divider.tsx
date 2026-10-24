import { cn } from "@/client/lib/utils"
import { CONTRAST_DARK, CONTRAST_LIGHT, getContrastColorForBackground, parseCssColor } from "./shared/contrast-color"
import { Plus } from "lucide-react"
import React from "react"
import { createPortal } from "react-dom"
import { ComponentSelectorPopover } from "./component-selector-popover"
import type { AppNodeTag } from "@/client/features/types"
import { useDragDrop } from "./drag-drop-context"
import type { ElementBox } from "./shared/use-element-box"

const MAX_ANCESTOR_DEPTH = 12
/** Visible thickness of an insertion divider, in pixels. See ADR 0014. */
export const DIVIDER_THICKNESS_PX = 2
/** Time the pointer has to reach the divider after leaving a child before it hides. */
const HIDE_DELAY_MS = 250
/** Wider invisible hit area around the 2px bar, so it is easy to click. Costs no layout. */
const HIT_AREA_PX = 8

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

type DividerEdge = "start" | "end"

/**
 * Insertion divider drawn as an overlay portalled to `document.body`, placed from the hovered
 * child's own box. It is never a flex item, so it can never shift surrounding elements.
 *
 * The whole bar is a clickable `<button>` with an accessible name and a hit area wider than the
 * 2px bar. Clicking it opens the component selector popover; the "+" is the visual cue.
 */
export const DividerOverlay = ({
  orientation,
  edge,
  box,
  onAddComponent,
  parentTag,
  parentId,
  insertIndex,
}: Readonly<{
  orientation: "vertical" | "horizontal"
  edge: DividerEdge
  box: ElementBox
  onAddComponent: (type: AppNodeTag, index: number) => void
  parentTag: AppNodeTag
  parentId: string
  insertIndex: number
}>) => {
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)
  const { state, setDropTarget, endDrag } = useDragDrop()
  const shown = popoverOpen || hovered
  const isDropTarget = state.dropTarget?.type === "divider" && state.dropTarget.parentId === parentId

  const barRef = React.useRef<HTMLButtonElement>(null)
  const color = useDividerContrastColor(barRef)
  const iconColor = color === CONTRAST_LIGHT ? CONTRAST_DARK : CONTRAST_LIGHT

  const handleAddComponent = (type: AppNodeTag) => {
    onAddComponent(type, insertIndex)
    setPopoverOpen(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (state.draggedComponentId) {
      setDropTarget({
        type: "divider",
        parentId,
        parentTag,
        index: insertIndex,
      })
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      if (state.dropTarget?.type === "divider" && state.dropTarget.parentId === parentId) {
        setDropTarget(null)
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    endDrag()
  }

  const isVertical = orientation === "vertical"
  const atEnd = edge === "end"
  const main = isVertical ? box.width : box.height
  const cross = isVertical ? box.height : box.width
  const halfHit = HIT_AREA_PX / 2
  const edgeOffset = atEnd ? main : 0

  const hitStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: 30,
    ...(isVertical
      ? { left: box.left + edgeOffset - halfHit, top: box.top, width: HIT_AREA_PX, height: cross }
      : { left: box.left, top: box.top + edgeOffset - halfHit, width: cross, height: HIT_AREA_PX }),
  }

  const barStyle: React.CSSProperties = {
    position: "absolute",
    backgroundColor: color,
    ...(isVertical
      ? { left: "50%", top: 0, width: DIVIDER_THICKNESS_PX, height: "100%", transform: "translateX(-50%)" }
      : { left: 0, top: "50%", width: "100%", height: DIVIDER_THICKNESS_PX, transform: "translateY(-50%)" }),
  }

  return createPortal(
    <ComponentSelectorPopover
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
      onSelect={handleAddComponent}
      parentTag={parentTag}
    >
      <button
        ref={barRef}
        type="button"
        aria-label="Add component here"
        style={hitStyle}
        className={cn(
          "flex items-center justify-center cursor-pointer transition-opacity duration-150 group",
          shown ? "opacity-100" : "opacity-0",
          isDropTarget && "bg-primary/50 ring-2 ring-primary ring-offset-2",
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div style={barStyle} aria-hidden="true" />
        <Plus className="absolute left-1/2 top-1/2 z-20 size-6 -translate-x-1/2 -translate-y-1/2" style={{ color: iconColor }} />
      </button>
    </ComponentSelectorPopover>,
    document.body,
  )
}

type DividerAxis = "v" | "h"

const dividerKey = (axis: DividerAxis, index: number) => `${axis}${index}`

/**
 * Divider visibility is keyed per edge. Show and hide each bump a generation so a
 * hide that already queued a state update cannot clobber a later show (the race
 * that left insertion dividers stuck visible or stuck invisible).
 *
 * Hide is delayed so the pointer can travel from a child edge onto the divider
 * bar and its + button without the control disappearing under the cursor.
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

  const hideDividerDelayed = React.useCallback((axis: DividerAxis, index: number) => {
    const key = dividerKey(axis, index)
    clearTimer(key)
    const generation = (generationRef.current[key] ?? 0) + 1
    generationRef.current[key] = generation
    timeoutRef.current[key] = setTimeout(() => {
      delete timeoutRef.current[key]
      setVisible(axis, index, false, generation)
    }, HIDE_DELAY_MS)
  }, [clearTimer, setVisible])

  React.useEffect(() => {
    const timeouts = timeoutRef.current
    return () => {
      for (const pending of Object.values(timeouts)) clearTimeout(pending)
    }
  }, [])

  const syncEdge = (axis: DividerAxis, index: number, near: boolean) => {
    if (near) showDivider(axis, index)
    else hideDividerDelayed(axis, index)
  }

  const handleChildMouseMove = (e: React.MouseEvent, childIndex: number) => {
    // The editor-controls wrapper is `display: contents`, so measure the component inside it.
    const rect = getLayoutRect(e.currentTarget)
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    syncEdge("v", childIndex * 2, x < rect.width * 0.3)
    syncEdge("v", (childIndex + 1) * 2, x > rect.width * 0.7)
    syncEdge("h", childIndex * 2, y < rect.height * 0.3)
    syncEdge("h", (childIndex + 1) * 2, y > rect.height * 0.7)
  }

  const handleChildMouseLeave = (childIndex: number) => {
    hideDividerDelayed("v", childIndex * 2)
    hideDividerDelayed("v", (childIndex + 1) * 2)
    hideDividerDelayed("h", childIndex * 2)
    hideDividerDelayed("h", (childIndex + 1) * 2)
  }

  return {
    visibleVerticalDividers,
    visibleHorizontalDividers,
    handleChildMouseMove,
    handleChildMouseLeave,
  }
}

/**
 * Rectangle of the element that actually has a box. The editor-controls wrapper is
 * `display: contents`, so its own rectangle is empty; its first element child is the component.
 */
function getLayoutRect(element: Element): DOMRect {
  if (!(element instanceof Element)) return (element as Element).getBoundingClientRect()
  const target = getComputedStyle(element).display === "contents" && element.firstElementChild
    ? element.firstElementChild
    : element
  return target.getBoundingClientRect()
}
