import React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/client/lib/utils"
import type { ElementBox } from "./shared/use-element-box"

type EditorOverlayProps = Readonly<{
  /** The component's box in document coordinates. */
  box: ElementBox
  /** Selected components get the strong outline; hovered ones a faint one. */
  selected: boolean
  /** Positioned relative to the component's box; the toolbar goes here. */
  children?: React.ReactNode
}>

/**
 * Editor chrome for one component, drawn outside the page's layout (ADR 0016).
 *
 * It is portalled to `document.body` and placed from the component's own box, so the component
 * stays the flex or grid item of its parent exactly as in preview. The container matches the
 * component's box, so children can anchor to it (`bottom-full`, `-right-1`) as if it were the
 * component. Only the toolbar takes pointer events; the outline never blocks the page.
 */
export function EditorOverlay({ box, selected, children }: EditorOverlayProps) {
  return createPortal(
    <div
      data-testid="editor-overlay"
      data-editor-chrome="true"
      className="pointer-events-none absolute z-30"
      style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
    >
      {/* Outline (not border) and a box-shadow, so the chrome never takes layout space. */}
      <div
        aria-hidden="true"
        data-testid="editor-outline"
        data-selected={selected ? "true" : "false"}
        className={cn(
          "absolute inset-0 outline-offset-2",
          selected
            ? "outline-2 outline-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.18)]"
            : "outline-1 outline-muted-foreground/50",
        )}
        style={{ borderRadius: box.radius }}
      />
      {children}
    </div>,
    document.body,
  )
}
