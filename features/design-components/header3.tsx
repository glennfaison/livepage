import { Heading } from "lucide-react"
import { ComponentProps, ComponentTag } from "./types"
import React from "react"
import { withTextEditing } from "./content-editable-hoc"

export type ComponentAttributes = {
	content: string
}

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

export const Component = withTextEditing((props: ComponentProps<typeof tag>) => {
	const { content } = props.attributes
	return (
		<h3 className="text-2xl font-bold py-2" {...props}>{content}</h3>
	)
})