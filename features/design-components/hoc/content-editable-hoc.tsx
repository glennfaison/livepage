import React, { useCallback } from "react"
import { DesignComponentProps, DesignComponentTag } from "../types"
import { useComponentOperationsContext } from "@/lib/component-operations-context"

interface WrappedComponentProps extends React.HTMLAttributes<HTMLElement> {
	contentEditable?: boolean
	suppressContentEditableWarning?: boolean
	onBlur?: React.FocusEventHandler<HTMLElement>
	onClick?: React.MouseEventHandler<HTMLElement>
	onDoubleClick?: React.MouseEventHandler<HTMLElement>
	onBlurCapture?: React.FocusEventHandler<HTMLElement>
}

export function withTextEditing<Tag extends Extract<DesignComponentTag, "header1" | "header2" | "header3" | "paragraph" | "inline-text" | "button">>(
	WrappedComponent: React.ComponentType<DesignComponentProps<Tag> & WrappedComponentProps>
) {
	return function ContentEditableComponent(props: DesignComponentProps<Tag>) {
		const [contentEditable, setContentEditable] = React.useState<boolean>(false)
		const { pageBuilderMode, component, ...otherProps } = props
		const { setSelectedComponent, updateComponent } = useComponentOperationsContext()
		const isConnected = !!props.component.attributes?.__datasource__

		const onBlur = useCallback((e: React.FocusEvent<HTMLElement>) => {
			e.stopPropagation()
			setContentEditable(false)
			const newText = e.currentTarget.textContent || ""
			// @ts-expect-error TODO: fix the argument type for the WrappedComponent
			updateComponent(component.attributes.id, { children: [newText] })
		}, [component.attributes.id, updateComponent])

		const onClick = useCallback(() => (e: React.MouseEvent<HTMLElement>) => {
			if (pageBuilderMode === "edit") {
				e.stopPropagation()
				setSelectedComponent(component.attributes.id)
			}
		}, [component.attributes.id, pageBuilderMode, setSelectedComponent])

		const onDoubleClick = useCallback(() => setContentEditable(true), [])

		return (
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
