import { Button } from "@/components/ui/button"
import { withDataSource } from "@/features/design-components/decorators/with-data-source"
import { MousePointerClick } from "lucide-react"
import React from "react"
import { withEditorControls } from "./decorators/with-editor-controls"
import { withTextEditing } from "./decorators/with-text-editing"
import type { Props, SettingsField, Metadata } from "@/features/types"
import { createAttributeMap, createTextAttribute, readTextChildren } from "./shared/component-helpers"

const tag = "button" as const

const label = "Button"

const keywords = ["button", "click", "action", "btn"]

const defaultChildren = ["Button"] as const

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
		placeholder: "Enter button text",
		defaultValue: "",
		getValue: (component) => readTextChildren(component),
		setValue: (component, value) => ({ ...component, children: [value] } as Props["component"]),
	}),
]

const attributesMap = createAttributeMap(attributes)

const Icon = <MousePointerClick className="h-4 w-4" />

const Component = (props: Props) => {
	const children = readTextChildren(props.component) || attributesMap.content.defaultValue
	const { pageBuilderMode: _, selectedComponentId: __, selectedComponentAncestors: ___, ...filteredProps } = props

	return (
		<Button {...filteredProps}>{children as React.ReactNode}</Button>
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