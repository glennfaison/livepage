import { Heading } from "lucide-react"
import { ComponentProps, ComponentTag } from "./types"
import React from "react"
import { withTextEditing } from "./hoc/content-editable-hoc"
import { withConnection } from "@/features/design-components/hoc/connected-component-hoc"
import { withEditorControls } from "./hoc/component-controls-hoc"

export type ComponentAttributes = {
	content: string
}

const defaultChildren = ["Header 2"]

export const defaultAttributes: ComponentAttributes = {
	content: "Header 2",
}

export const tag: ComponentTag = "header2" as const

export const label = "Header 2"

export const keywords = ["h2", "title", "subtitle", "header", "heading", "medium"]

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
	return (
		<h2 className="text-3xl font-bold py-2" {...props}>{children as React.ReactNode}</h2>
	)
}

const WithContentEditing = withTextEditing(Component_)
const ConnectedComponent = withConnection(WithContentEditing)
export const Component = withEditorControls(ConnectedComponent)