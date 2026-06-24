import { withDataSource } from "@/features/design-components/decorators/with-data-source"
import { Heading } from "lucide-react"
import React from "react"
import { withEditorControls } from "./decorators/with-editor-controls"
import { withTextEditing } from "./decorators/with-text-editing"
import type { Props, SettingsField, Metadata } from "@/features/types"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createTextAttribute, readCustomClasses, readTextChildren } from "./shared/component-helpers"
import { cn } from "@/lib/utils"

const tag = "header1" as const

const label = "Header 1"

const keywords = ["h1", "title", "header", "heading", "large"]

const defaultChildren = ["Header 1"] as const

const attributes: SettingsField[] = [
	createIdAttribute(),
	createCustomClassesAttribute(),
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
	const customClasses = readCustomClasses(props.component.attributes)
	const { pageBuilderMode: _, selectedComponentId: __, selectedComponentAncestors: ___, ...filteredProps } = props

	return (
		<h1 className={cn("text-4xl font-bold py-2", customClasses)} {...filteredProps}>{children as React.ReactNode}</h1>
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