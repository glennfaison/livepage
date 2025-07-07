import { withConnection } from "@/features/design-components/hoc/connected-component-hoc"
import { Heading } from "lucide-react"
import React from "react"
import { withEditorControls } from "./hoc/component-controls-hoc"
import { withTextEditing } from "./hoc/content-editable-hoc"
import { ComponentProps, ComponentTag, DesignComponent } from "./types"

export type ComponentAttributes = {
	id: string
}

export const tag: ComponentTag = "header1" as const

export const label = "Header 1"

export const keywords = ["h1", "title", "header", "heading", "large"]

export const defaultChildren = ["Header 1"] as const

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
		placeholder: "Enter header text",
		defaultValue: defaultChildren,
		getValue: (component: DesignComponent<typeof tag>) => component.children,
		setValue: (component: DesignComponent<typeof tag>, value: unknown) => {
			return { ...component, children: Array.isArray(value) ? value : [value], }
		},
	},
}

export const Icon = <Heading className="h-4 w-4" />

const Component_ = (props: ComponentProps<typeof tag>) => {
	const children = props.component.children?.length ? props.component.children : settingsFields.content.defaultValue
	const filteredProps: Partial<ComponentProps<typeof tag>> = { ...props }
	delete filteredProps.pageBuilderMode
	delete filteredProps.selectedComponentId

	return (
		<h1 className="text-4xl font-bold py-2" {...filteredProps}>{children as React.ReactNode}</h1>
	)
}

const WithContentEditing = withTextEditing(Component_)
const ConnectedComponent = withConnection(WithContentEditing)
export const Component = withEditorControls(ConnectedComponent)