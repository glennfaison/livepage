import React from "react"
import type { AppNode, PageBuilderMode } from "@/client/features/types"
import { getComponentInfo, PreviewRenderer } from "@/client/features/design-components"
import { DataSourceErrorBoundary } from "@/client/components/error-boundary"

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
      <DataSourceErrorBoundary isPreviewMode={true}>
        <PreviewRenderer
          {...rest}
          pageBuilderMode="preview"
          component={component}
        />
      </DataSourceErrorBoundary>
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
