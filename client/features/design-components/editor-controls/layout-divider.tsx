import { cn } from "@/client/lib/utils"
import { CONTRAST_DARK, CONTRAST_LIGHT, getContrastColorForBackground, parseCssColor } from "./shared/contrast-color"
import { Plus } from "lucide-react"
import React from "react"
import { createPortal } from "react-dom"
import { ComponentSelectorPopover } from "./component-selector-popover"
import type { AppNodeTag } from "@/client/features/types"
import { useDragDrop } from "./drag-drop-context"
import type { ElementBox } from "./shared/use-element-box"

/** Marks editor chrome portalled over the page, so sampling the page's colors can look through it. */
export const EDITOR_CHROME_ATTRIBUTE = "data-editor-chrome"
/** Visible thickness of an insertion divider, in pixels. See ADR 0014. */
export const DIVIDER_THICKNESS_PX = 4
/** How long a divider lingers once the pointer is no longer near its edge. */
export const DIVIDER_HIDE_DELAY_MS = 1000
/** Wider invisible hit area around the bar, so it is easy to click. Costs no layout. */
const HIT_AREA_PX = DIVIDER_THICKNESS_PX + 8
/** Diameter of the round "+" badge centered on the bar. */
export const DIVIDER_BADGE_PX = 24

/** Portal root shared by every divider overlay. Portalling into a dedicated element instead of
 * `document.body` directly keeps React's unmount from throwing `NotFoundError` when something
 * (e.g. a test teardown) wipes `document.body.innerHTML`: the overlay node stays a child of the
 * detached container, so `container.removeChild(node)` still succeeds. */
let portalRoot: HTMLDivElement | null = null
function getPortalRoot(): HTMLDivElement {
  if (!portalRoot || !document.body.contains(portalRoot)) {
    portalRoot?.remove()
    portalRoot = document.createElement("div")
    portalRoot.setAttribute(EDITOR_CHROME_ATTRIBUTE, "true")
    document.body.appendChild(portalRoot)
  }
  return portalRoot
}

/**
 * The first opaque background color at a viewport point: the topmost page element there (editor
 * chrome is skipped) or its nearest ancestor that paints one. Returns null when nothing does, or
 * where `elementsFromPoint` is unavailable.
 */
export const measureBackgroundAt = (x: number, y: number): string | null => {
  if (typeof document === "undefined" || typeof document.elementsFromPoint !== "function") return null
  const clampedX = Math.min(Math.max(x, 0), window.innerWidth - 1)
  const clampedY = Math.min(Math.max(y, 0), window.innerHeight - 1)
  const target = document.elementsFromPoint(clampedX, clampedY).find((el) => !el.closest(`[${EDITOR_CHROME_ATTRIBUTE}]`))
  for (let node = target ?? null; node; node = node.parentElement) {
    const bg = window.getComputedStyle(node).backgroundColor
    if (parseCssColor(bg)) return bg
  }
  return null
}

/**
 * Contrast color for a bar drawn over the page at a document-coordinate point. The overlay lives
 * in a portal, so its own ancestors say nothing about what is under it: sample the page itself.
 */
export const useDividerContrastColor = (documentX: number, documentY: number) => {
  const [color, setColor] = React.useState(CONTRAST_DARK)
  React.useEffect(() => {
    const measure = () =>
      setColor(getContrastColorForBackground(measureBackgroundAt(documentX - window.scrollX, documentY - window.scrollY)))
    measure()
    const frame = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(frame)
  }, [documentX, documentY])
  return color
}

type DividerEdge = "start" | "end"

/**
 * Insertion divider drawn as an overlay portalled to `document.body`, placed from the hovered
 * child's own box. It is never a flex item, so it can never shift surrounding elements.
 *
 * The whole bar is a clickable `<button>` with an accessible name and a hit area wider than the
 * bar. Clicking it opens the component selector popover; the "+" is the visual cue.
 *
 * The parent mounts the overlay only while its divider is visible, so a mounted overlay is always
 * drawn. While the pointer is on it or its popover is open, it holds its divider (`onHold`) so the
 * parent's hide timer cannot unmount it from under the cursor.
 */
export const DividerOverlay = ({
  orientation,
  edge,
  box,
  onAddComponent,
  onHold,
  parentTag,
  parentId,
  insertIndex,
}: Readonly<{
  orientation: "vertical" | "horizontal"
  edge: DividerEdge
  box: ElementBox
  onAddComponent: (type: AppNodeTag, index: number) => void
  onHold: DividerHold
  parentTag: AppNodeTag
  parentId: string
  insertIndex: number
}>) => {
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)
  const { state, setDropTarget, endDrag } = useDragDrop()
  const isVertical = orientation === "vertical"
  const held = hovered || popoverOpen
  const axis: DividerAxis = isVertical ? "v" : "h"
  // Registers with the parent's visibility store (an external system) while held. The cleanup
  // also runs on unmount, so a hold can never outlive its overlay.
  React.useEffect(() => (held ? onHold(axis, insertIndex) : undefined), [held, onHold, axis, insertIndex])
  const isDropTarget = state.dropTarget?.type === "divider" && state.dropTarget.parentId === parentId

  // Sample 1px inside the hovered child: the bar straddles its edge, and the child is what the
  // user is looking at.
  const sampleX = isVertical ? (edge === "start" ? box.left + 1 : box.left + box.width - 1) : box.left + box.width / 2
  const sampleY = isVertical ? box.top + box.height / 2 : edge === "start" ? box.top + 1 : box.top + box.height - 1
  const color = useDividerContrastColor(sampleX, sampleY)
  const iconColor = color === CONTRAST_LIGHT ? CONTRAST_DARK : CONTRAST_LIGHT

  const handleAddComponent = (type: AppNodeTag) => {
    onAddComponent(type, insertIndex)
    setPopoverOpen(false)
    setHovered(false)
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
        type="button"
        aria-label="Add component here"
        style={hitStyle}
        className={cn(
          "flex items-center justify-center cursor-pointer animate-in fade-in-0 duration-150",
          isDropTarget && "bg-primary/50 ring-2 ring-primary ring-offset-2",
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div style={barStyle} aria-hidden="true" />
        {/* Solid badge in the bar color, so the "+" stays legible on any background. The thin ring
            in the icon color keeps the badge itself visible where the bar color does not contrast. */}
        <span
          data-testid="divider-add-badge"
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-sm"
          style={{
            width: DIVIDER_BADGE_PX,
            height: DIVIDER_BADGE_PX,
            backgroundColor: color,
            color: iconColor,
            boxShadow: `0 0 0 2px ${iconColor}`,
          }}
        >
          <Plus className="size-4" strokeWidth={3} />
        </span>
      </button>
    </ComponentSelectorPopover>,
    getPortalRoot(),
  )
}

type DividerAxis = "v" | "h"

/** Keeps a divider visible until the returned release function is called. */
export type DividerHold = (axis: DividerAxis, insertIndex: number) => () => void

const dividerKey = (axis: DividerAxis, insertIndex: number) => `${axis}${insertIndex}`

/**
 * Divider visibility, keyed per axis and insertion index (the index a component would get if
 * inserted there). Show and hide each go through a generation so a hide that already queued a
 * state update cannot clobber a later show (the race that left insertion dividers stuck visible
 * or stuck invisible).
 *
 * Hide is delayed so the pointer can travel from a child edge onto the divider bar and its +
 * button without the control disappearing under the cursor. A pending hide keeps its original
 * deadline: moving around inside the child does not push it back, so the divider lingers for a
 * predictable time. A divider that is held (see `holdDivider`) is not hidden at all.
 */
export const useDividerVisibility = () => {
  const [visibleVerticalDividers, setVisibleVerticalDividers] = React.useState<Set<number>>(() => new Set())
  const [visibleHorizontalDividers, setVisibleHorizontalDividers] = React.useState<Set<number>>(() => new Set())
  const generationRef = React.useRef<Record<string, number>>({})
  const timeoutRef = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const holdCountRef = React.useRef<Record<string, number>>({})

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
    if (holdCountRef.current[key] || timeoutRef.current[key]) return
    const generation = (generationRef.current[key] ?? 0) + 1
    generationRef.current[key] = generation
    timeoutRef.current[key] = setTimeout(() => {
      delete timeoutRef.current[key]
      setVisible(axis, index, false, generation)
    }, DIVIDER_HIDE_DELAY_MS)
  }, [setVisible])

  const holdDivider = React.useCallback<DividerHold>((axis, index) => {
    const key = dividerKey(axis, index)
    holdCountRef.current[key] = (holdCountRef.current[key] ?? 0) + 1
    showDivider(axis, index)
    return () => {
      const remaining = (holdCountRef.current[key] ?? 1) - 1
      if (remaining > 0) holdCountRef.current[key] = remaining
      else delete holdCountRef.current[key]
      hideDividerDelayed(axis, index)
    }
  }, [showDivider, hideDividerDelayed])

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

    syncEdge("v", childIndex, x < rect.width * 0.3)
    syncEdge("v", childIndex + 1, x > rect.width * 0.7)
    syncEdge("h", childIndex, y < rect.height * 0.3)
    syncEdge("h", childIndex + 1, y > rect.height * 0.7)
  }

  const handleChildMouseLeave = (childIndex: number) => {
    hideDividerDelayed("v", childIndex)
    hideDividerDelayed("v", childIndex + 1)
    hideDividerDelayed("h", childIndex)
    hideDividerDelayed("h", childIndex + 1)
  }

  return {
    visibleVerticalDividers,
    visibleHorizontalDividers,
    handleChildMouseMove,
    handleChildMouseLeave,
    holdDivider,
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
