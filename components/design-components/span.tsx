import { Type } from "lucide-react"

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
	content: "Inline text.",
}

export const tag = "span" as const

export const Label = "Inline Text"

export const keywords = ["span", "text", "inline", "content"]

export const settingsFields = {
	content: {
		id: "content",
		type: "text",
		label: "Content",
		placeholder: "Enter inline text",
	},
}

export const Icon = () => <Type className="h-4 w-4" />

export const Component = ({ componentId, componentAttributes, pageBuilderMode, setSelectedComponent, updateComponent }: ComponentProps) => {
	const { content, ...restAttributes } = componentAttributes
	return (
		<span
			className="inline"
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
		</span>
	)
}