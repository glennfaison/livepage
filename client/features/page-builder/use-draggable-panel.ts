import { useRef, useState } from "react"
import type React from "react"

export type PanelOffset = Readonly<{ x: number; y: number }>

type Rect = Readonly<{ left: number; top: number; width: number; height: number }>
type Size = Readonly<{ width: number; height: number }>

const ORIGIN: PanelOffset = { x: 0, y: 0 }

/** Distance one arrow-key press moves the panel. */
const KEYBOARD_STEP = 16

const ARROW_DIRECTIONS: Readonly<Record<string, PanelOffset>> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
}

/**
 * Keeps a panel inside the viewport. `anchor` is the panel's rectangle at a
 * zero offset (where its owner placed it), so the clamp holds however far the
 * owner has since moved the anchor. A panel larger than the viewport pins to
 * the top/left margin rather than flipping.
 */
export function clampPanelOffset(offset: PanelOffset, anchor: Rect, viewport: Size, margin: number): PanelOffset {
  const minX = margin - anchor.left
  const minY = margin - anchor.top
  const maxX = Math.max(minX, viewport.width - margin - (anchor.left + anchor.width))
  const maxY = Math.max(minY, viewport.height - margin - (anchor.top + anchor.height))
  return {
    x: Math.min(Math.max(offset.x, minX), maxX),
    y: Math.min(Math.max(offset.y, minY), maxY),
  }
}

type DragSession = Readonly<{
  pointerId: number
  startX: number
  startY: number
  startOffset: PanelOffset
  anchor: Rect
}>

/**
 * Moves a panel the caller has already placed (for example a Radix popover) by
 * a translate offset, so the owner keeps control of anchoring and collisions.
 * Spread `handleProps` on the grip element: dragging uses pointer capture, so
 * no document listeners are needed, and the arrow keys nudge the panel for
 * keyboard users. Double-click on the grip returns the panel to its anchor.
 */
export function useDraggablePanel(margin: number) {
  const panelRef = useRef<HTMLDivElement>(null)
  const sessionRef = useRef<DragSession | null>(null)
  const [offset, setOffset] = useState<PanelOffset>(ORIGIN)
  const [isDragging, setIsDragging] = useState(false)

  const measureAnchor = (current: PanelOffset): Rect | null => {
    const rect = panelRef.current?.getBoundingClientRect()
    if (!rect) return null
    return { left: rect.left - current.x, top: rect.top - current.y, width: rect.width, height: rect.height }
  }

  const moveTo = (next: PanelOffset, anchor: Rect) => {
    setOffset(clampPanelOffset(next, anchor, { width: window.innerWidth, height: window.innerHeight }, margin))
  }

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return
    const anchor = measureAnchor(offset)
    if (!anchor) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    sessionRef.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, startOffset: offset, anchor }
    setIsDragging(true)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const session = sessionRef.current
    if (!session || session.pointerId !== e.pointerId) return
    moveTo(
      { x: session.startOffset.x + e.clientX - session.startX, y: session.startOffset.y + e.clientY - session.startY },
      session.anchor,
    )
  }

  const endDrag = (e: React.PointerEvent<HTMLElement>) => {
    if (sessionRef.current?.pointerId !== e.pointerId) return
    sessionRef.current = null
    setIsDragging(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const direction = ARROW_DIRECTIONS[e.key]
    if (!direction) return
    const anchor = measureAnchor(offset)
    if (!anchor) return
    e.preventDefault()
    moveTo({ x: offset.x + direction.x * KEYBOARD_STEP, y: offset.y + direction.y * KEYBOARD_STEP }, anchor)
  }

  const reset = () => setOffset(ORIGIN)

  return {
    panelRef,
    offset,
    isDragging,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onKeyDown,
      onDoubleClick: reset,
    },
  }
}
