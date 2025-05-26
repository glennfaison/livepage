import { MousePointerClick } from "lucide-react"
import { Button } from "../ui/button"
import { ComponentType } from "./types"

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
	content: "Button",
}

export const tag: ComponentType = "button" as const

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

export const Component = ({ componentId, componentAttributes, pageBuilderMode, setSelectedComponent, updateComponent }: ComponentProps) => {
	const { content, ...restAttributes } = componentAttributes
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