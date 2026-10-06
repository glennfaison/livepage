import React from "react"
import type { AppNode, PageBuilderMode } from "@/client/features/types"
import { getComponentInfo, PreviewRenderer } from "@/client/features/design-components"
import { DragProvider, useComponentOperationsContext } from "@/client/features/design-components/editor-controls"

export type CanvasRendererProps = Readonly<{
  component: AppNode
  pageBuilderMode: PageBuilderMode
  selectedComponentId: string
  selectedComponentAncestors: ReadonlyArray<AppNode>
  childClassName?: string
}>

export function CanvasRenderer(props: CanvasRendererProps) {
  const { component, pageBuilderMode, ...rest } = props
  const { moveComponent } = useComponentOperationsContext()

  if (pageBuilderMode === "preview") {
    return (
      <PreviewRenderer
        {...rest}
        pageBuilderMode="preview"
        component={component}
      />
    )
  }

  const EditModeComponent = getComponentInfo(component.tag).EditModeComponent
  return (
    <DragProvider moveComponent={moveComponent}>
      <EditModeComponent
        {...rest}
        pageBuilderMode="edit"
        component={component}
      />
    </DragProvider>
  )
}
