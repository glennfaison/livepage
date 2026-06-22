import { withConnection } from "@/features/design-components/hoc/connected-component-hoc"
import { Heading } from "lucide-react"
import React from "react"
import { withEditorControls } from "./hoc/component-controls-hoc"
import { withTextEditing } from "./hoc/content-editable-hoc"
import type { Props, Attribute, Metadata } from "./types"

const tag = "header2" as const

const label = "Header 2"

const keywords = ["h2", "title", "subtitle", "header", "heading", "medium"]

const defaultChildren = ["Header 2"] as const

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
		<h2 className="text-3xl font-bold py-2" {...filteredProps}>{children as React.ReactNode}</h2>
	)
}

export const componentMetadata = {
	tag,
	label,
	keywords,
	defaultChildren,
	attributes,
	Icon,
	ViewModeComponent: withConnection(Component),
	EditModeComponent: withEditorControls(withTextEditing(withConnection(Component))),
} as const satisfies Metadata