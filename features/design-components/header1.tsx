import { withDataSource } from "@/features/design-components/decorators/with-data-source"
import { Heading } from "lucide-react"
import React from "react"
import { withEditorControls } from "./decorators/with-editor-controls"
import { withTextEditing } from "./decorators/with-text-editing"
import type { Props, Attribute, Metadata } from "./types"

const tag = "header1" as const

const label = "Header 1"

const keywords = ["h1", "title", "header", "heading", "large"]

const defaultChildren = ["Header 1"] as const

const attributes: Attribute[] = [
	{
		id: "id",
		type: "text",
		label: "ID",
		readOnly: true,
		disabled: true,
		placeholder: "ID",
		defaultValue: "",
		getValue: (component) => component.attributes.id || "",
		setValue: (component, value: string) => ({ ...component, attributes: { ...component.attributes, id: value } } as Props["component"]),
	},
	{
		id: "content",
		type: "text",
		label: "Content",
		placeholder: "Enter header text",
		defaultValue: "",
		getValue: (component) => {
			if (!component.children) return ""
			if (Array.isArray(component.children)) {
				return component.children.map(child => typeof child === "string" ? child : "").join("")
			}
			return typeof component.children === "string" ? component.children : ""
		},
		setValue: (component, value: unknown) => ({ ...component, children: Array.isArray(value) ? value : [value] } as Props["component"]),
	},
]

const attributesMap = Object.fromEntries((attributes).map((s) => [s.id, s]))

const Icon = <Heading className="h-4 w-4" />

const Component = (props: Props) => {
	const children = props.component.children?.length ? props.component.children : attributesMap.content.defaultValue
	const { pageBuilderMode: _, selectedComponentId: __, selectedComponentAncestors: ___, ...filteredProps } = props

	return (
		<h1 className="text-4xl font-bold py-2" {...filteredProps}>{children as React.ReactNode}</h1>
	)
}

export const componentMetadata = {
	tag,
	label,
	keywords,
	defaultChildren,
	attributes,
	Icon,
	ViewModeComponent: withDataSource(Component),
	EditModeComponent: withEditorControls(withTextEditing(withDataSource(Component))),
} as const satisfies Metadata