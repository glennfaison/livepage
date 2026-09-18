import type { ReactNode } from "react"
import type { AppNode, ViewModeProps } from "@/features/types"
import { getComponentInfo } from "@/features/design-component-runtime/registry"

export function renderPreviewNode(
  node: AppNode | string,
  props: ViewModeProps,
  key?: string | number,
): ReactNode {
  if (typeof node === "string") return node

  const PreviewModeComponent = getComponentInfo(node.tag).PreviewModeComponent
  return <PreviewModeComponent {...props} component={node} key={key} />
}

export function PreviewRenderer(
  props: ViewModeProps & { node?: AppNode | string },
) {
  const { node = props.component, ...rendererProps } = props
  return renderPreviewNode(node, rendererProps)
}
