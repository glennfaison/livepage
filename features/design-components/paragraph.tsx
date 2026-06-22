import { withDataSource } from "@/features/design-components/decorators/with-data-source"
import { Type } from "lucide-react"
import React from "react"
import { withEditorControls } from "./decorators/with-editor-controls"
import { withTextEditing } from "./decorators/with-text-editing"
import type { Props, Attribute, Metadata } from "./types"

const defaultChildren = [
	`Morbi consequat justo enim, sed accumsan metus blandit eget. Etiam ornare neque
	sagittis metus hendrerit tincidunt. Sed sed vulputate quam. Vivamus rutrum elit
	quis mauris aliquet dictum. Praesent iaculis ornare posuere. Sed pretium sed
	mauris non mollis. Pellentesque sem purus, sagittis sed odio commodo, faucibus
	vehicula elit. Mauris vestibulum euismod mi, feugiat accumsan mauris imperdiet
	eget. Ut sit amet dolor mattis, consectetur est id, placerat tellus. Proin nisl
	odio, elementum sed porttitor ut, tempus non neque. In hac habitasse platea
	dictumst. Proin at lorem lacinia, ullamcorper lorem eget, fringilla massa.
	Suspendisse consequat, lectus sit amet congue tincidunt, neque felis
	pellentesque nulla, ac pharetra lectus elit eget neque. Sed feugiat tincidunt
	leo, ac pretium metus. In suscipit iaculis mi, sit amet euismod justo posuere
	sit amet.`
] as const

const tag = "paragraph" as const

const label = "Paragraph"

const keywords = ["p", "text", "content", "paragraph", "body"]

const attributes = [
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
		type: "textarea",
		label: "Content",
		placeholder: "Enter paragraph text",
		defaultValue: [],
		getValue: (component) => {
			if (!component.children) return []
			if (typeof component.children === "string") return [component.children]
			if (Array.isArray(component.children)) {
				return component.children
			}
			return []
		},
		setValue: (component, value) => {
			return { ...component, children: Array.isArray(value) ? value : [value], } as Props["component"]
		},
	},
] as const satisfies Attribute[]

const attributesMap = Object.fromEntries((attributes).map((s) => [s.id, s]))

const Icon = <Type className="h-4 w-4" />

const Component = (props: Props) => {
	const children = props.component.children?.length ? props.component.children : attributesMap.content.defaultValue
	const { pageBuilderMode: _, selectedComponentId: __, selectedComponentAncestors: ___, ...filteredProps } = props

	return (
		<p className="py-2" {...filteredProps}>{children as React.ReactNode}</p>
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