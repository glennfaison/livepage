import React from "react"
import type { AppNodeTag } from "@/client/features/types"
import { useComponentOperationsContext } from "./component-operations-context"
import { useDragDrop } from "./drag-drop-context"
import { DividerOverlay, useDividerVisibility } from "./layout-divider"
import type { DividerOrientation } from "./layout-divider"
import { getLayoutElement, readElementBox } from "./shared/use-element-box"
import type { ElementBox } from "./shared/use-element-box"

/**
 * Insertion dividers for a layout component (a row draws vertical dividers between its children,
 * a column horizontal ones). Rows and columns differ only in `orientation`.
 *
 * Give each child `handleChildMouseMove` / `handleChildMouseLeave` and, for drags,
 * `handleChildDragOver` / `handleChildDragLeave`, and render `dividers` next to the children. One overlay is drawn per visible insertion point, anchored to the child
 * edge the pointer was last near.
 */
export const useLayoutDividers = ({
  orientation,
  parentTag,
  parentId,
}: Readonly<{
  orientation: DividerOrientation
  parentTag: AppNodeTag
  parentId: string
}>) => {
  const { addComponent } = useComponentOperationsContext()
  const { state: dragState } = useDragDrop()
  const { visibleDividers, handleChildMouseMove: trackPointer, handleChildMouseLeave, holdDivider } =
    useDividerVisibility(orientation)
  const [childBoxes, setChildBoxes] = React.useState<ReadonlyMap<number, ElementBox>>(() => new Map())

  const handleAddAtIndex = React.useCallback(
    (tag: string, index: number) => addComponent({ tag, parentId, index }),
    [addComponent, parentId],
  )

  // Children report their own box as the pointer moves over them; that box is what a divider
  // anchored to the child is drawn from.
  const handleChildMouseMove = (e: React.MouseEvent, childIndex: number) => {
    const box = readElementBox(getLayoutElement(e.currentTarget as Element))
    if (box) setChildBoxes((prev) => new Map(prev).set(childIndex, box))
    trackPointer(e, childIndex)
  }

  // Browsers fire no mouse events during a drag, so dragover stands in for them. A layout does not
  // offer drop positions while it is being dragged itself: it cannot be moved into itself.
  const acceptsDrops = dragState.draggedComponentId !== null && dragState.draggedComponentId !== parentId
  const handleChildDragOver = (e: React.DragEvent, childIndex: number) => {
    if (acceptsDrops) handleChildMouseMove(e, childIndex)
  }

  const dividers = Array.from(visibleDividers, ([insertIndex, { childIndex, edge }]) => {
    const box = childBoxes.get(childIndex)
    if (!box) return null
    return (
      <DividerOverlay
        key={insertIndex}
        orientation={orientation}
        edge={edge}
        box={box}
        onAddComponent={handleAddAtIndex}
        onHold={holdDivider}
        parentTag={parentTag}
        parentId={parentId}
        insertIndex={insertIndex}
      />
    )
  })

  return {
    handleChildMouseMove,
    handleChildMouseLeave,
    handleChildDragOver,
    handleChildDragLeave: handleChildMouseLeave,
    dividers,
  }
}
