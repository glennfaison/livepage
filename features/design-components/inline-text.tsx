import { Type } from "lucide-react"
import { ComponentProps, ComponentTag } from "./types"
import { withTextEditing } from "./hoc/content-editable-hoc"
import React from "react"
import { withConnection } from "@/features/design-components/hoc/connected-component-hoc"
import { withEditorControls } from "./hoc/component-controls-hoc"

export type ComponentAttributes = {
	content: string
}

export const defaultChildren = ["Inline text."]

export const defaultAttributes: ComponentAttributes = {
	content: "Inline text.",
}

export const tag: ComponentTag = "inline-text" as const

export const label = "Inline Text"

export const keywords = ["span", "text", "inline", "content"]

export const settingsFields = {
	content: {
		id: "content",
		type: "text",
		label: "Content",
		placeholder: "Enter inline text",
	},
}

export const Icon = <Type className="h-4 w-4" />

const Component_ = (props: ComponentProps<typeof tag>) => {
	const children = props.component.children?.length ? props.component.children : defaultChildren
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