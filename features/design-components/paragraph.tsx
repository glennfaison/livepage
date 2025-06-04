import { Type } from "lucide-react"
import { ComponentProps, ComponentTag } from "./types"
import React from "react"

export type ComponentAttributes = {
	content: string
}

export const defaultAttributes: ComponentAttributes = {
	content: "Morbi consequat justo enim, sed accumsan metus blandit eget"
	+ "Etiam ornare neque sagittis metus hendrerit tincidunt."
	+ "Sed sed vulputate quam. Vivamus rutrum elit quis mauris aliquet dictum."
	+ "Praesent iaculis ornare posuere. Sed pretium sed mauris non mollis."
	+ "Pellentesque sem purus, sagittis sed odio commodo, faucibus vehicula elit."
	+ "Mauris vestibulum euismod mi, feugiat accumsan mauris imperdiet eget."
	+ "Ut sit amet dolor mattis, consectetur est id, placerat tellus."
	+ "Proin nisl odio, elementum sed porttitor ut, tempus non neque."
	+ "In hac habitasse platea dictumst. Proin at lorem lacinia,"
	+ "ullamcorper lorem eget, fringilla massa. Suspendisse consequat, lectus sit"
	+ "amet congue tincidunt, neque felis pellentesque nulla, ac pharetra lectus"
	+ "elit eget neque. Sed feugiat tincidunt leo, ac pretium metus. In suscipit"
	+ "iaculis mi, sit amet euismod justo posuere sit amet.",
}

export const tag: ComponentTag = "paragraph" as const

export const label = "Paragraph"

export const keywords = ["p", "text", "content", "paragraph", "body"]

export const settingsFields = {
	content: {
		id: "content",
		type: "textarea",
		label: "Content",
		placeholder: "Enter paragraph text",
	},
}

export const Icon = <Type className="h-4 w-4" />

export const Component = ({ componentId, attributes, pageBuilderMode, setSelectedComponent, updateComponent }: ComponentProps<typeof tag>) => {
	const [contentEditable, setContentEditable] = React.useState<boolean>(false)
	const { content, ...restAttributes } = attributes

	return (
		<p
			className="py-2"
			contentEditable={pageBuilderMode === "edit" && contentEditable}
			suppressContentEditableWarning
			onBlur={(e) => updateComponent(componentId, { content: e.currentTarget.textContent || "" })}
			onClick={(e) => {
				if (pageBuilderMode === "edit") {
					e.stopPropagation()
					setSelectedComponent(componentId)
				}
			}}
			onDoubleClick={() => setContentEditable(true)}
			onBlurCapture={() => setContentEditable(false)}
			{...restAttributes}
		>
			{content}
		</p>
	)
}