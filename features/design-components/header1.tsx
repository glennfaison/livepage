import { Heading } from "lucide-react"
import { ComponentProps, ComponentTag } from "./types"
import React from "react"
import { withTextEditing } from "./content-editable-hoc"

export type ComponentAttributes = {
	content: string
}

export const defaultAttributes: ComponentAttributes = {
	content: "Header 1",
}

export const tag: ComponentTag = "header1" as const

export const label = "Header 1"

export const keywords = ["h1", "title", "header", "heading", "large"]

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
		<h1 className="text-4xl font-bold py-2" {...props}>{content}</h1>
	)
})