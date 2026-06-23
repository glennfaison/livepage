import { withDataSource } from "@/features/design-components/decorators/with-data-source"
import { Type } from "lucide-react"
import React from "react"
import { withEditorControls } from "./decorators/with-editor-controls"
import { withTextEditing } from "./decorators/with-text-editing"
import type { Props, Metadata, Attribute } from "./types"
import { createAttributeMap, createTextAttribute, createTextareaAttribute, readTextArrayChildren } from "./shared/component-helpers"

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

const attributes: Attribute[] = [
	createTextAttribute({
		id: "id",
		label: "ID",
		placeholder: "ID",
		defaultValue: "",
		readOnly: true,
		disabled: true,
	}),
	createTextareaAttribute({
		id: "content",
		label: "Content",
		placeholder: "Enter paragraph text",
		defaultValue: [],
		getValue: (component) => readTextArrayChildren(component),
		setValue: (component, value) => ({ ...component, children: [...value] } as Props["component"]),
	}),
]

const attributesMap = createAttributeMap(attributes)

const Icon = <Type className="h-4 w-4" />

const Component = (props: Props) => {
	const children = readTextArrayChildren(props.component)
	const renderedChildren = children.length ? children : attributesMap.content.defaultValue
	const { pageBuilderMode: _, selectedComponentId: __, selectedComponentAncestors: ___, ...filteredProps } = props

	return (
		<p className="py-2" {...filteredProps}>{renderedChildren as React.ReactNode}</p>
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
