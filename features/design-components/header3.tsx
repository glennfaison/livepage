import { withDataSource } from "@/features/design-components/decorators/with-data-source"
import { Heading } from "lucide-react"
import React from "react"
import { withEditorControls } from "./decorators/with-editor-controls"
import { withTextEditing } from "./decorators/with-text-editing"
import type { Props, SettingsField, Metadata } from "@/features/types"
import { createAttributeMap, createTextAttribute, readTextChildren } from "./shared/component-helpers"

const tag = "header3" as const

const label = "Header 3"

const keywords = ["h3", "title", "subtitle", "subheading", "header", "heading", "small"]

const defaultChildren = ["Header 3"] as const

const attributes: SettingsField[] = [
	createTextAttribute({
		id: "id",
		label: "ID",
		placeholder: "ID",
		defaultValue: "",
		readOnly: true,
		disabled: true,
	}),
	createTextAttribute({
		id: "content",
		label: "Content",
		placeholder: "Enter header text",
		defaultValue: "",
		getValue: (component) => readTextChildren(component),
		setValue: (component, value) => ({ ...component, children: [value] } as Props["component"]),
	}),
]

const attributesMap = createAttributeMap(attributes)

const Icon = <Heading className="h-4 w-4" />

const Component = (props: Props) => {
	const children = readTextChildren(props.component) || attributesMap.content.defaultValue
	const { pageBuilderMode: _, selectedComponentId: __, selectedComponentAncestors: ___, ...filteredProps } = props

	return (
		<h3 className="text-2xl font-bold py-2" {...filteredProps}>{children as React.ReactNode}</h3>
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