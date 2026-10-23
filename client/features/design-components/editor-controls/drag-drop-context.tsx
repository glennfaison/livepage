"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import type { AppNodeTag } from "@/client/features/types"

export type DropTargetType = "divider" | "empty-layout"

export type DragDropState = Readonly<{
  draggedComponentId: string | null
  draggedComponentTag: AppNodeTag | null
  dropTarget: Readonly<{
    type: DropTargetType
    parentId: string
    parentTag: AppNodeTag
    index?: number
    dividerIndex?: number
  }> | null
}>

type DragDropContextValue = Readonly<{
  state: DragDropState
  startDrag: (componentId: string, componentTag: AppNodeTag) => void
  setDropTarget: (target: DragDropState["dropTarget"]) => void
  endDrag: () => void
  moveComponent: (componentId: string, newParentId: string, index?: number) => void
}>

const DragDropContext = createContext<DragDropContextValue | null>(null)

export function DragDropProvider({
  children,
  moveComponent,
}: Readonly<{
  children: React.ReactNode
  moveComponent: (componentId: string, newParentId: string, index?: number) => void
}>) {
  const [draggedComponentId, setDraggedComponentId] = useState<string | null>(null)
  const [draggedComponentTag, setDraggedComponentTag] = useState<AppNodeTag | null>(null)
  const [dropTarget, setDropTarget] = useState<DragDropState["dropTarget"]>(null)

  const startDrag = useCallback((componentId: string, componentTag: AppNodeTag) => {
    setDraggedComponentId(componentId)
    setDraggedComponentTag(componentTag)
  }, [])

  const handleSetDropTarget = useCallback((target: DragDropState["dropTarget"]) => {
    setDropTarget(target)
  }, [])

  const endDrag = useCallback(() => {
    if (draggedComponentId && dropTarget) {
      // Divider drop targets store the index in the interspersed children+dividers array
      // (0, 2, 4, ...). insertComponent / moveComponent expect a child index, so convert.
      // The + button path already does Math.floor(dividerIndex / 2); this matches it.
      // Same-parent reordering adjustment (subtract 1 when the moved item was before the
      // target) is handled inside moveComponent so the index here is the pre-removal desired position.
      const insertIndex =
        dropTarget.type === "divider" && typeof dropTarget.index === "number"
          ? Math.floor(dropTarget.index / 2)
          : dropTarget.index
      moveComponent(draggedComponentId, dropTarget.parentId, insertIndex)
    }
    setDraggedComponentId(null)
    setDraggedComponentTag(null)
    setDropTarget(null)
  }, [draggedComponentId, dropTarget, moveComponent])

  const value: DragDropContextValue = {
    state: {
      draggedComponentId,
      draggedComponentTag,
      dropTarget,
    },
    startDrag,
    setDropTarget: handleSetDropTarget,
    endDrag,
    moveComponent,
  }

  return <DragDropContext.Provider value={value}>{children}</DragDropContext.Provider>
}

export function useDragDrop() {
  const context = useContext(DragDropContext)
  if (!context) {
    throw new Error("useDragDrop must be used within a DragDropProvider")
  }
  return context
}
