import React from "react"
import { Minus } from "lucide-react"
import { withDataSource } from "@/client/features/data-sources"
import { withEditorControls } from "../editor-controls/decorators/with-editor-controls"
import type { Metadata, Props, SettingsField, ComponentCategory } from "@/client/features/types"
import { createColorAttribute, createCustomClassesAttribute, createIdAttribute, createSelectAttribute, readCustomClasses, getAccessibilityAttributes, getComponentInfo } from "@/client/features/design-components/primitives"
import { cn } from "@/client/lib/utils"

const tag = "divider" as const
const label = "Divider"
const keywords = ["divider", "separator", "line", "rule", "section"]
const attributes: SettingsField[] = [
  createIdAttribute(),
  createCustomClassesAttribute(),
  createSelectAttribute({ id: "style", label: "Style", options: ["solid", "dashed", "dotted"], defaultValue: "solid" }),
  createColorAttribute({ id: "color", label: "Color", defaultValue: "#e5e7eb" }),
]
const Icon = <Minus className="h-4 w-4" />

const Component = (props: Props) => {
  const { style = "solid", color = "#e5e7eb" } = props.component.attributes
  const metadata = getComponentInfo(props.component.tag)
  const accessibilityAttrs = getAccessibilityAttributes(props.component, metadata)
  return <hr className={cn("my-4 w-full border-0 border-t", readCustomClasses(props.component.attributes), props.childClassName)} style={{ borderTopStyle: style as React.CSSProperties["borderTopStyle"], borderTopColor: color }} aria-hidden="true" {...accessibilityAttrs} />
}

export const componentMetadata = {
	tag, label, category: "Feedback" as ComponentCategory, keywords, defaultChildren: [], attributes, Icon, htmlTag: "hr",
	PreviewModeComponent: withDataSource(Component),
	EditModeComponent: withEditorControls(withDataSource(Component)),
} as const satisfies Metadata

