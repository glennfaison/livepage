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
      moveComponent(draggedComponentId, dropTarget.parentId, dropTarget.index)
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