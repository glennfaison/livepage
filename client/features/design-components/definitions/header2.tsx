import { withDataSource } from "@/client/features/data-sources"
import { Heading } from "lucide-react"
import React from "react"
import { withEditorControls } from "../editor-controls/decorators/with-editor-controls"
import { withTextEditing } from "../editor-controls/decorators/with-text-editing"
import type { Props, Metadata, SettingsField } from "@/client/features/types"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createTextAppearanceAttributes, createTextAttribute, readCustomClasses, readTextAppearance, readTextChildren } from "@/client/features/design-components/primitives"
import { cn } from "@/client/lib/utils"

const defaultChildren = ["Heading 2"] as const

const tag = "header2" as const

const label = "Heading 2"

const keywords = ["h2", "heading", "title", "header", "subtitle"]

const attributes: SettingsField[] = [
	createIdAttribute(),
	createCustomClassesAttribute(),
	createTextAttribute({
		id: "content",
		label: "Content",
		placeholder: "Enter heading text",
		defaultValue: defaultChildren[0],
		getValue: (component) => readTextChildren(component),
		setValue: (component, value) => ({ ...component, children: [value] } as Props["component"]),
	}),
	createTextAppearanceAttributes(),
]

const attributesMap = createAttributeMap(attributes)

const Icon = <Heading className="h-4 w-4" />

const Component = (props: Props) => {
	const children = readTextChildren(props.component) || attributesMap.content.defaultValue
	const customClasses = readCustomClasses(props.component.attributes)
	const textAppearance = readTextAppearance(props.component.attributes)
	const { pageBuilderMode: _, selectedComponentId: __, selectedComponentAncestors: ___, childClassName, parentTag: ____, component: _____, ...filteredProps } = props

	return (
		<h2 className={cn("text-3xl font-bold py-2", customClasses, childClassName)} style={textAppearance} {...filteredProps}>{children as React.ReactNode}</h2>
	)
}

export const componentMetadata = {
	tag,
	htmlTag: "h2",
	label,
	keywords,
	defaultChildren,
	attributes,
	Icon,
	PreviewModeComponent: withDataSource(Component),
	EditModeComponent: withEditorControls(withTextEditing(withDataSource(Component))),
} as const satisfies Metadata
