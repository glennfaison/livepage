import React from "react"
import { Minus } from "lucide-react"
import { withDataSource } from "@/features/data-sources/with-data-source"
import { withEditorControls } from "@/features/page-builder/editor-controls"
import type { Metadata, Props, SettingsField } from "@/features/types"
import { createColorAttribute, createCustomClassesAttribute, createIdAttribute, createSelectAttribute, readCustomClasses } from "@/features/design-component-runtime/primitives"
import { cn } from "@/lib/utils"

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
  return <hr className={cn("my-4 w-full border-0 border-t", readCustomClasses(props.component.attributes), props.childClassName)} style={{ borderTopStyle: style as React.CSSProperties["borderTopStyle"], borderTopColor: color }} aria-hidden="true" />
}

export const componentMetadata = {
  tag, label, keywords, defaultChildren: [], attributes, Icon, htmlTag: "hr",
  PreviewModeComponent: withDataSource(Component),
  EditModeComponent: withEditorControls(withDataSource(Component)),
} as const satisfies Metadata

