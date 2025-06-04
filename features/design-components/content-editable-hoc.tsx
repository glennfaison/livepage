import React from "react"
import { ComponentAttributes, ComponentProps, ComponentTag } from "./types"

interface WrappedComponentProps extends React.HTMLAttributes<HTMLElement> {
	contentEditable?: boolean
	suppressContentEditableWarning?: boolean
	onBlur?: React.FocusEventHandler<HTMLElement>
	onClick?: React.MouseEventHandler<HTMLElement>
	onDoubleClick?: React.MouseEventHandler<HTMLElement>
	onBlurCapture?: React.FocusEventHandler<HTMLElement>
}

export function withTextEditing<Tag extends Extract<ComponentTag, "header1" | "header2" | "header3" | "paragraph" | "inline-text" | "button">>(
	WrappedComponent: React.ComponentType<ComponentProps<Tag> & WrappedComponentProps>
) {
	return function ContentEditableComponent({
		componentId,
		pageBuilderMode,
		setSelectedComponent,
		updateComponent,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		replaceComponent,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		removeComponent,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		addComponent,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		duplicateComponent,
		...otherProps
	}: ComponentProps<Tag>) {
		const [contentEditable, setContentEditable] = React.useState<boolean>(false)
		const isConnected = !!otherProps.attributes?.__data_source__
		return (
			// @ts-expect-error TODO: fix the argument type for the WrappedComponent
			<WrappedComponent
				pageBuilderMode={pageBuilderMode}
				componentId={componentId}
				contentEditable={pageBuilderMode === "edit" && contentEditable && !isConnected}
				suppressContentEditableWarning
				onBlur={(e: React.FocusEvent<HTMLElement>) =>
					updateComponent(componentId, {
						content: e.currentTarget.textContent || "",
					} as Partial<ComponentAttributes<Tag>>)
				}
				onClick={(e: React.MouseEvent<HTMLElement>) => {
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
