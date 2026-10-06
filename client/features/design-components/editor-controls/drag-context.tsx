"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import type { AppNode } from "@/client/features/types"

interface DragState {
  draggedComponent: AppNode | null
  draggedComponentId: string | null
  sourceParentId: string | null
  sourceIndex: number | null
  isDragging: boolean
}

interface DragContextValue extends DragState {
  startDrag: (component: AppNode, parentId: string, index: number) => void
  endDrag: () => void
  cancelDrag: () => void
  moveComponent: (args: { componentId: string; newParentId: string; index: number }) => void
}

const defaultDragContextValue: DragContextValue = {
  draggedComponent: null,
  draggedComponentId: null,
  sourceParentId: null,
  sourceIndex: null,
  isDragging: false,
  startDrag: () => {},
  endDrag: () => {},
  cancelDrag: () => {},
  moveComponent: () => {},
}

const DragContext = createContext<DragContextValue>(defaultDragContextValue)

export function useDragContext() {
  return useContext(DragContext)
}

interface DragProviderProps {
  children: React.ReactNode
  moveComponent: (args: { componentId: string; newParentId: string; index: number }) => void
}

export function DragProvider({ children, moveComponent }: DragProviderProps) {
  const [draggedComponent, setDraggedComponent] = useState<AppNode | null>(null)
  const [draggedComponentId, setDraggedComponentId] = useState<string | null>(null)
  const [sourceParentId, setSourceParentId] = useState<string | null>(null)
  const [sourceIndex, setSourceIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const startDrag = useCallback((component: AppNode, parentId: string, index: number) => {
    setDraggedComponent(component)
    setDraggedComponentId(component.attributes.id)
    setSourceParentId(parentId)
    setSourceIndex(index)
    setIsDragging(true)
  }, [])

  const endDrag = useCallback(() => {
    setDraggedComponent(null)
    setDraggedComponentId(null)
    setSourceParentId(null)
    setSourceIndex(null)
    setIsDragging(false)
  }, [])

  const cancelDrag = useCallback(() => {
    setDraggedComponent(null)
    setDraggedComponentId(null)
    setSourceParentId(null)
    setSourceIndex(null)
    setIsDragging(false)
  }, [])

  return (
    <DragContext.Provider
      value={{
        draggedComponent,
        draggedComponentId,
        sourceParentId,
        sourceIndex,
        isDragging,
        startDrag,
        endDrag,
        cancelDrag,
        moveComponent,
      }}
    >
      {children}
    </DragContext.Provider>
  )
}