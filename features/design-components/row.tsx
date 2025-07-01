import { AlignHorizontalSpaceBetween, Plus } from "lucide-react"
import { ComponentProps, ComponentTag, DesignComponent } from "./types"
import { intersperseAndAppend } from "@/lib/utils"
import { componentTagList, getComponentInfo } from "."
import { ComponentSelectorPopover } from "@/components/page-builder/component-selector-popover"
import { Button } from "@/components/ui/button"
import { useCallback } from "react"
import React from "react"
import { Divider, useDividerVisibility } from "@/components/page-builder/layout-divider"
import { withConnection } from "@/features/design-components/hoc/connected-component-hoc"
import { withEditorControls } from "./hoc/component-controls-hoc"
import { useComponentOperationsContext } from "@/lib/component-operations-context"

export type ComponentAttributes = {
	id: string
}

export const tag: ComponentTag = "row" as const

export const label = "Row"

export const keywords = ["row", "container", "layout", "horizontal"]

export const settingsFields = {
	id: {
		id: "id",
		type: "text",
		label: "ID",
		placeholder: "ID",
		defaultValue: "",
		getValue: (component: DesignComponent<typeof tag>) => component.attributes.id || "",
		setValue: (component: DesignComponent<typeof tag>, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, id: value } };
		},
	},
}

export const Icon = <AlignHorizontalSpaceBetween className="h-4 w-4" />

const Component_ = (props: ComponentProps<typeof tag>) => {
	const { component } = props
	const hasChildren = !!component.children.length
	const { addComponent } = useComponentOperationsContext()
	const {
		visibleVerticalDividers,
		handleChildMouseMove,
		handleChildMouseLeave,
	} = useDividerVisibility()

	const onAddChildComponent = useCallback(
		(tag: ComponentTag): void => addComponent({ tag, parentId: component.attributes.id, index: 0 }),
		[addComponent, component.attributes.id]
	)

	const handleAddAtIndex = useCallback((tag: ComponentTag, dividerIndex: number) => {
		const childIndex = Math.floor(dividerIndex / 2)
		addComponent({ tag, parentId: component.attributes.id, index: childIndex })
	}, [addComponent, component.attributes.id])

	const children = props.component.children.map(
		(child, childIndex) => {
			const ChildComponent = getComponentInfo(child.tag).Component
			return (
				<span className="flex-1"
					key={child.attributes.id}
					onMouseMove={(e) => handleChildMouseMove(e, childIndex)}
					onMouseLeave={() => handleChildMouseLeave(childIndex)}
				>
					<ChildComponent {...props as ComponentProps<ComponentTag>} component={child} />
				</span>
			)
		}
	)
	const WrappedChilden = props.pageBuilderMode === "preview" ? children : (
		intersperseAndAppend(children, null).map((item, index) => {
			return item === null ? (
				<Divider
					key={`divider-${index}`}
					orientation="vertical"
					onAddComponent={handleAddAtIndex}
					index={index}
					isVisible={visibleVerticalDividers.has(index)} />
			) : (
				<React.Fragment key={index}>{item}</React.Fragment>
			)
		})
	)

	return (
		<div className="p-4 border border-dashed border-gray-300 min-h-[50px] flex flex-row gap-2 justify-center"
			{...props.component.attributes}
		>
			{hasChildren ? WrappedChilden : (
				<div className="flex items-center justify-center h-full text-muted-foreground flex-1">
					<ComponentSelectorPopover onSelect={onAddChildComponent} componentTagList={componentTagList}>
						<Button variant="outline" size="icon" className="rounded-full h-6 w-6">
							<Plus className="h-3 w-3" />
							<span className="sr-only">Add component</span>
						</Button>
					</ComponentSelectorPopover>
				</div>
			)}
		</div>
	);
}

const ConnectedComponent = withConnection(Component_)
export const Component = withEditorControls(ConnectedComponent)