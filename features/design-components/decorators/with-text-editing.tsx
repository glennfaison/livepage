import React, { useCallback } from "react"
import type { EditModeProps } from "../types"
import { useComponentOperationsContext } from "@/lib/component-operations-context"
import { appSettings } from "@/app/app-settings"

interface WrappedComponentProps extends React.HTMLAttributes<HTMLElement> {
	contentEditable?: boolean
	suppressContentEditableWarning?: boolean
	onBlur?: React.FocusEventHandler<HTMLElement>
	onClick?: React.MouseEventHandler<HTMLElement>
	onDoubleClick?: React.MouseEventHandler<HTMLElement>
	onBlurCapture?: React.FocusEventHandler<HTMLElement>
}

export function withTextEditing(
	WrappedComponent: React.ComponentType<EditModeProps & WrappedComponentProps>
) {
	return function TextEditingComponent(props: EditModeProps) {
		const [contentEditable, setContentEditable] = React.useState<boolean>(false)
		const { pageBuilderMode, component, ...otherProps } = props
		const { setSelectedComponent, updateComponent } = useComponentOperationsContext()
		const isConnected = !!props.component.attributes?.[appSettings.dataSources.dataSourceFieldName]

		const onBlur = useCallback((e: React.FocusEvent<HTMLElement>) => {
			e.stopPropagation()
			setContentEditable(false)
			const newText = e.currentTarget.textContent || ""
			// Cast to any because children may be represented as inline text in metadata defaults
			updateComponent(component.attributes.id, { children: [newText] as any })
		}, [component.attributes.id, updateComponent])

		const onClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
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
