import { Heading } from "lucide-react"
import { ComponentProps, ComponentTag } from "./types"
import React from "react"
import { withTextEditing } from "./hoc/content-editable-hoc"
import { withConnection } from "@/features/design-components/hoc/connected-component-hoc"
import { withEditorControls } from "./hoc/component-controls-hoc"

export type ComponentAttributes = {
	content: string
}

export const defaultChildren = ["Header 3"]

export const defaultAttributes: ComponentAttributes = {
	content: "Header 3",
}

export const tag: ComponentTag = "header3" as const

export const label = "Header 3"

export const keywords = ["h3", "title", "subtitle", "subheading", "header", "heading", "small"]

export const settingsFields = {
	content: {
		id: "content",
		type: "text",
		label: "Content",
		placeholder: "Enter header text",
	},
}

export const Icon = <Heading className="h-4 w-4" />

const Component_ = (props: ComponentProps<typeof tag>) => {
	const children = props.component.children?.length ? props.component.children : defaultChildren
	const filteredProps: Partial<ComponentProps<typeof tag>> = { ...props }
	delete filteredProps.pageBuilderMode
	delete filteredProps.selectedComponentId

	return (
		<h3 className="text-2xl font-bold py-2" {...filteredProps}>{children as React.ReactNode}</h3>
	)
}

const WithContentEditing = withTextEditing(Component_)
const ConnectedComponent = withConnection(WithContentEditing)
export const Component = withEditorControls(ConnectedComponent)