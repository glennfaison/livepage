import { MousePointerClick } from "lucide-react"
import { Button } from "../../components/ui/button"
import { ComponentProps, ComponentTag } from "./types"

export type ComponentAttributes = {
	content: string
}

export const defaultAttributes: ComponentAttributes = {
	content: "Button",
}

export const tag: ComponentTag = "button" as const

export const label = "Button"

export const keywords = ["button", "click", "action", "btn"]

export const settingsFields = {
	content: {
		id: "content",
		type: "text",
		label: "Content",
		placeholder: "Enter button text",
	},
}

export const Icon = <MousePointerClick className="h-4 w-4" />

export const Component = ({ componentId, attributes, pageBuilderMode, setSelectedComponent, updateComponent }: ComponentProps<typeof tag>) => {
	const { content, ...restAttributes } = attributes
	return (
		<Button
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
		</Button>
	)
}