import { useEffect, useState } from "react"

/** A component's box in document coordinates (viewport rect plus page scroll). */
export type ElementBox = Readonly<{
  top: number
  left: number
  width: number
  height: number
  /** Computed `border-radius`, so overlay outlines follow rounded components. */
  radius: string
}>

/**
 * Rectangle of the element that actually has a box. The editor-controls wrapper is
 * `display: contents`, so its own rectangle is empty; its first element child is the component.
 */
export function getLayoutRect(element: Element): DOMRect {
  if (!(element instanceof Element)) return (element as Element).getBoundingClientRect()
  const target = getComputedStyle(element).display === "contents" && element.firstElementChild
    ? element.firstElementChild
    : element
  return target.getBoundingClientRect()
}

/** Reads an element's box, or `null` when it has none (not rendered, `display: none`, ...). */
/**
 * The element that actually has a box. The editor-controls wrapper is `display: contents`, so its
 * own rectangle is empty; its first element child is the component.
 */
export function getLayoutElement(element: Element): Element {
  return getComputedStyle(element).display === "contents" && element.firstElementChild
    ? element.firstElementChild
    : element
}

export function readElementBox(element: Element | null | undefined): ElementBox | null {
  if (!element) return null
  const rect = element.getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) return null
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
    radius: getComputedStyle(element).borderRadius,
  }
}

const sameBox = (a: ElementBox | null, b: ElementBox | null): boolean =>
  a === b ||
  (a !== null && b !== null &&
    a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height && a.radius === b.radius)

/**
 * Tracks an element's box while `active`. Scrolling does not change document coordinates, but
 * layout changes (edits, data loading, resizes, reflow from siblings) do and no single event
 * reports them, so the box is re-read every animation frame and state only changes when the
 * box does. Nothing runs while inactive.
 */
export function useElementBox(getElement: () => Element | null | undefined, active: boolean): ElementBox | null {
  const [box, setBox] = useState<ElementBox | null>(null)

  useEffect(() => {
    if (!active) {
      setBox(null)
      return
    }
    let frame = 0
    const tick = () => {
      const next = readElementBox(getElement())
      setBox((previous) => (sameBox(previous, next) ? previous : next))
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [active, getElement])

  return box
}
