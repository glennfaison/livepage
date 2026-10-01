import React from "react"
import type { AppNode, PageBuilderMode } from "@/features/types"
import { getComponentInfo, PreviewRenderer } from "@/features/design-components"

export type CanvasRendererProps = Readonly<{
  component: AppNode
  pageBuilderMode: PageBuilderMode
  selectedComponentId: string
  selectedComponentAncestors: ReadonlyArray<AppNode>
  childClassName?: string
}>

export function CanvasRenderer(props: CanvasRendererProps) {
  const { component, pageBuilderMode, ...rest } = props

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
    <EditModeComponent
      {...rest}
      pageBuilderMode="edit"
      component={component}
    />
  )
}
