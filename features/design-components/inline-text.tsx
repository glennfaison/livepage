import { withConnection } from "@/features/design-components/hoc/connected-component-hoc"
import { Type } from "lucide-react"
import React from "react"
import { withEditorControls } from "./hoc/component-controls-hoc"
import { withTextEditing } from "./hoc/content-editable-hoc"
import { ComponentProps, ComponentTag, DesignComponent } from "./types"

export type ComponentAttributes = {
	id: string
}

export const tag: ComponentTag = "inline-text" as const

export const label = "Inline Text"

export const keywords = ["span", "text", "inline", "content"]

export const defaultChildren = ["Inline text."] as const

export const settingsFields = {
	id: {
		id: "id",
		type: "text",
		label: "ID",
		readOnly: true,
		disabled: true,
		placeholder: "ID",
		defaultValue: "",
		getValue: (component: DesignComponent<typeof tag>) => component.attributes.id || "",
		setValue: (component: DesignComponent<typeof tag>, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, id: value } };
		},
	},
	content: {
		id: "content",
		type: "text",
		label: "Content",
		placeholder: "Enter inline text",
		defaultValue: defaultChildren,
		getValue: (component: DesignComponent<typeof tag>) => component.children,
		setValue: (component: DesignComponent<typeof tag>, value: unknown) => {
			return { ...component, children: Array.isArray(value) ? value : [value], }
		},
	},
}

export const Icon = <Type className="h-4 w-4" />

const Component_ = (props: ComponentProps<typeof tag>) => {
	const children = props.component.children?.length ? props.component.children : settingsFields.content.defaultValue
	const filteredProps: Partial<ComponentProps<typeof tag>> = { ...props }
	delete filteredProps.pageBuilderMode
	delete filteredProps.selectedComponentId

	return (
		<span className="inline" {...filteredProps}>{children as React.ReactNode}</span>
	)
}

const WithContentEditing = withTextEditing(Component_)
const ConnectedComponent = withConnection(WithContentEditing)
export const Component = withEditorControls(ConnectedComponent)