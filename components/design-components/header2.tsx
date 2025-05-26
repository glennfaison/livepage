import { Heading } from "lucide-react"

export type ComponentAttributes = {
	content: string
}

export type ComponentProps = {
	componentId: string
	componentAttributes: ComponentAttributes
	pageBuilderMode: "edit" | "preview"
	setSelectedComponent: (componentId: string) => void
	updateComponent: (componentId: string, updates: Partial<ComponentAttributes>) => void
}

export const defaultAttributes: ComponentAttributes = {
	content: "Header 2",
}

export const tag = "header2" as const

export const Label = "Header 2"

export const keywords = ["h2", "title", "subtitle", "header", "heading", "medium"]

export const settingsFields = {
	content: {
		id: "content",
		type: "text",
		label: "Content",
		placeholder: "Enter header text",
	},
}

export const Icon = () => <Heading className="h-4 w-4" />

export const Component = ({ componentId, componentAttributes, pageBuilderMode, setSelectedComponent, updateComponent }: ComponentProps) => {
	const { content, ...restAttributes } = componentAttributes
	return (
		<h2
			className="text-3xl font-bold py-2"
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
		</h2>
	)
}