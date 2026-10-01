import type { ReactNode } from "react"
import type { AppNode, ViewModeProps } from "@/client/features/types"
import { getComponentInfo } from "./registry"

export function PreviewRenderer({
  node,
  ...props
}: ViewModeProps & { node?: AppNode | string }): ReactNode {
  const targetNode = node ?? props.component
  if (typeof targetNode === "string") return targetNode

  const PreviewModeComponent = getComponentInfo(targetNode.tag).PreviewModeComponent
  return <PreviewModeComponent {...props} component={targetNode} />
}

