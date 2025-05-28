import { Heading } from "lucide-react"
import { ComponentType } from "./types"

export type ComponentAttributes = {
	content: string
}

export type ComponentProps = {
	componentId: string
	attributes: ComponentAttributes
	pageBuilderMode: "edit" | "preview"
	setSelectedComponent: (componentId: string) => void
	updateComponent: (componentId: string, updates: Partial<ComponentAttributes>) => void
}

export const defaultAttributes: ComponentAttributes = {
	content: "Header 3",
}

export const tag: ComponentType = "header3" as const

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

export const Component = ({ componentId, attributes, pageBuilderMode, setSelectedComponent, updateComponent }: ComponentProps) => {
	const { content, ...restAttributes } = attributes
	return (
		<h3
			className="text-2xl font-bold py-2"
			contentEditable={pageBuilderMode === "edit"}
			suppressContentEditableWarning
			onBlur={(e) => updateComponent(componentId, { content: e.currentTarget.textContent || "" })}
			onClick={(e) => {
				if (pageBuilderMode === "edit") {
					e.stopPropagation()
					setSelectedComponent(componentId)
				}
			}}
			{...restAttributes}
		>
			{content}
		</h3>
	)
}