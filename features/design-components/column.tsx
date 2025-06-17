import { AlignVerticalSpaceBetween, Plus } from "lucide-react"
import { ComponentProps, ComponentTag } from "./types"
import { ComponentSelectorPopover } from "@/components/page-builder/component-selector-popover"
import { useDividerVisibility, Divider } from "@/components/page-builder/layout-divider"
import { Button } from "@/components/ui/button"
import { intersperseAndAppend } from "@/lib/utils"
import React, { useCallback } from "react"
import { getComponentInfo, componentTagList } from "."
import { withConnection } from "@/features/design-components/hoc/connected-component-hoc"
import { withEditorControls } from "./hoc/component-controls-hoc"

export type ComponentAttributes = object

export const defaultChildren = []

export const defaultAttributes: ComponentAttributes = {
}

export const tag: ComponentTag = "column" as const

export const label = "Column"

export const keywords = ["column", "col", "container", "layout", "vertical"]

export const settingsFields = {
}

export const Icon = <AlignVerticalSpaceBetween className="h-4 w-4 bg-gray-200 rounded" />

const Component_ = (props: ComponentProps<typeof tag>) => {
	const { addComponent } = props
	const { component } = props
	const hasChildren = !!component.children.length
	const {
		visibleHorizontalDividers,
		handleChildMouseMove,
		handleChildMouseLeave,
	} = useDividerVisibility()

	const onAddChildComponent = useCallback(
		(tag: ComponentTag): void => addComponent({ tag, parentId: component.id, index: 0 }),
		[addComponent, component.id]
	)

	const handleAddAtIndex = useCallback((tag: ComponentTag, dividerIndex: number) => {
		const childIndex = Math.floor(dividerIndex / 2)
		addComponent({ tag, parentId: component.id, index: childIndex })
	}, [addComponent, component.id])

	const children = props.component.children.map(
		(child, childIndex) => {
			const ChildComponent = getComponentInfo(child.tag).Component
			return (
				<span className="flex-1"
					key={child.id}
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
					orientation="horizontal"
					onAddComponent={handleAddAtIndex}
					index={index}
					isVisible={visibleHorizontalDividers.has(index)} />
			) : (
				<React.Fragment key={index}>{item}</React.Fragment>
			)
		})
	)
	
	return (
		<div
			className="p-4 border border-dashed border-gray-300 min-h-[50px] flex flex-col gap-2 justify-center"
			id={props.component.id}
			{...props.component.attributes}
		>
			{hasChildren ? WrappedChilden : (
				<div className="flex items-center justify-center h-full w-full text-muted-foreground">
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