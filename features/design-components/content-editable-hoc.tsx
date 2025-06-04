import React from "react"
import { ComponentProps, ComponentTag } from "./types"

export function withTextEditing<Tag extends Extract<ComponentTag, "header1" | "header2" | "header3" | "paragraph" | "inline-text" | "button">>(
	WrappedComponent: React.ComponentType<ComponentProps<Tag>>
) {
	return function ContentEditableComponent({ 
		componentId,
		pageBuilderMode,
		setSelectedComponent,
		updateComponent,
		replaceComponent,
		removeComponent,
		addComponent,
		duplicateComponent,
		...otherProps
	}: ComponentProps<Tag>) {
		const [contentEditable, setContentEditable] = React.useState<boolean>(false)
		const isConnected = !!otherProps.attributes?.__data_source__
	
		return (
			<WrappedComponent
				contentEditable={pageBuilderMode === "edit" && contentEditable && !isConnected}
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
				{...otherProps}
			>
			</WrappedComponent>
		)
	}
}
