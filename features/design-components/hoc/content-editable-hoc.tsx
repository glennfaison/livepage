import React, { useCallback } from "react"
import { ComponentProps, ComponentTag } from "../types"

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
	return function ContentEditableComponent(props: ComponentProps<Tag>) {
		const [contentEditable, setContentEditable] = React.useState<boolean>(false)
		const { pageBuilderMode, component, setSelectedComponent, updateComponent, ...otherProps } = props
		const isConnected = !!props.component.attributes?.__data_source__

		const onBlur = useCallback((e: React.FocusEvent<HTMLElement>) => {
			e.stopPropagation()
			setContentEditable(false)
			const newText = e.currentTarget.textContent || ""
			// @ts-expect-error TODO: fix the argument type for the WrappedComponent
			updateComponent(component.id, { children: [newText] })
		}, [component.id, updateComponent])

		const onClick = useCallback(() => (e: React.MouseEvent<HTMLElement>) => {
			if (pageBuilderMode === "edit") {
				e.stopPropagation()
				setSelectedComponent(component.id)
			}
		}, [component.id, pageBuilderMode, setSelectedComponent])

		const onDoubleClick = useCallback(() => setContentEditable(true), [])

		return (
			// @ts-expect-error TODO: fix the argument type for the WrappedComponent
			<WrappedComponent
				pageBuilderMode={pageBuilderMode}
				contentEditable={pageBuilderMode === "edit" && !isConnected && contentEditable}
				suppressContentEditableWarning
				onBlur={onBlur}
				onClick={onClick}
				onDoubleClick={onDoubleClick}
				{...otherProps}
				component={component}
			>
			</WrappedComponent>
		)
	}
}
