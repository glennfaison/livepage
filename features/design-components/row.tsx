import React, { useCallback } from "react"
import { AlignHorizontalSpaceBetween, Plus } from "lucide-react"
import type { Attribute, Metadata, EditModeProps, Props, ViewModeProps } from "./types"
import { ComponentSelectorPopover } from "@/features/page-builder/component-selector-popover"
import { Divider, useDividerVisibility } from "@/features/page-builder/layout-divider"
import { Button } from "@/components/ui/button"
import { cn, intersperseAndAppend } from "@/lib/utils"
import { componentTagList, getComponentInfo } from "."
import { withDataSource } from "@/features/design-components/decorators/with-data-source"
import { useComponentOperationsContext } from "@/lib/component-operations-context"
import { withEditorControls } from "./decorators/with-editor-controls"
import { createAttributeMap, createSpacingAttributes, readBoxSpacing } from "./shared/component-helpers"

const tag = "row" as const

const label = "Row"

const keywords = ["row", "container", "layout", "horizontal"]

const attributes = [
	{
		id: "id",
		type: "text",
		label: "ID",
		readOnly: true,
		disabled: true,
		placeholder: "ID",
		defaultValue: "",
		getValue: (component) => component.attributes.id || "",
		setValue: (component, value: string) => ({ ...component, attributes: { ...component.attributes, id: value } } as Props["component"]),
	},
	...createSpacingAttributes("padding"),
	...createSpacingAttributes("margin"),
] as const satisfies ReadonlyArray<Attribute>

const attributesMap = createAttributeMap(attributes)

const Icon = <AlignHorizontalSpaceBetween className="size-4" />

const _ViewModeComponent = (props: ViewModeProps) => {
	const { component } = props
	const attributes = component.attributes
	const padding = readBoxSpacing(attributes, attributesMap, "padding")
	const margin = readBoxSpacing(attributes, attributesMap, "margin")

	const childComponents = props.component.children.map((child) => {
		if (typeof child === "string") {
			return child
		}
		const meta = getComponentInfo(child.tag)
		const ChildComponent = meta.ViewModeComponent

		return (
			<span className="flex-1" key={child.attributes.id}>
				<ChildComponent {...props} component={child} />
			</span>
		)
	})

	return (
		<div
			className={cn("min-h-[50px] flex flex-row justify-center items-start", "p-0 gap-0")}
			{...attributes}
			style={{
				padding: `${padding.top} ${padding.right} ${padding.bottom} ${padding.left}`,
				margin: `${margin.top} ${margin.right} ${margin.bottom} ${margin.left}`,
			}}
		>
			{childComponents}
		</div>
	)
}

type EmptyColumnContentProps = {
	onAddChildComponent: (tag: string) => void
}

const EmptyColumnContent: React.ComponentType<EmptyColumnContentProps> = (props) => {
	return (
		<div className="flex items-center justify-center h-full w-full text-muted-foreground">
			<ComponentSelectorPopover onSelect={props.onAddChildComponent} componentTagList={componentTagList}>
				<Button variant="outline" size="icon" className="rounded-full h-6 w-6">
					<Plus className="h-3 w-3" />
					<span className="sr-only">Add component</span>
				</Button>
			</ComponentSelectorPopover>
		</div>
	)
}

const _EditModeComponent = (props: EditModeProps) => {
	const { component } = props
	const attributes = component.attributes
	const padding = readBoxSpacing(attributes, attributesMap, "padding")
	const margin = readBoxSpacing(attributes, attributesMap, "margin")
	const hasChildren = !!component.children.length
	const { addComponent } = useComponentOperationsContext()
	const {
		visibleVerticalDividers,
		handleChildMouseMove,
		handleChildMouseLeave,
	} = useDividerVisibility()

	const onAddChildComponent = useCallback(
		(tag: string): void => addComponent({ tag, parentId: attributes.id, index: 0 }),
		[addComponent, attributes.id]
	)

	const handleAddAtIndex = useCallback((tag: string, dividerIndex: number) => {
		const childIndex = Math.floor(dividerIndex / 2)
		addComponent({ tag, parentId: attributes.id, index: childIndex })
	}, [addComponent, attributes.id])

	const children = component.children.map((child, childIndex) => {
		if (typeof child === "string") return child
		const meta = getComponentInfo(child.tag)
		const ChildComponent = meta.EditModeComponent
		return (
			<span className="flex-1"
				key={child.attributes.id}
				onMouseMove={(e) => handleChildMouseMove(e, childIndex)}
				onMouseLeave={() => handleChildMouseLeave(childIndex)}
			>
				<ChildComponent {...props} component={child} />
			</span>
		)
	})

	const WrappedChildren = intersperseAndAppend(children, null).map((item, index) => {
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

	return (
		<div
			className={cn(
				"min-h-[50px] flex flex-row justify-center items-start",
				"p-0 gap-0",
				"border border-dashed border-gray-300",
			)}
			{...attributes}
			style={{
				padding: `${padding.top} ${padding.right} ${padding.bottom} ${padding.left}`,
				margin: `${margin.top} ${margin.right} ${margin.bottom} ${margin.left}`,
			}}
		>
			{hasChildren ? WrappedChildren : <EmptyColumnContent onAddChildComponent={onAddChildComponent} />}
		</div>
	)
}

export const componentMetadata = {
	tag,
	label,
	keywords,
	defaultChildren: [],
	attributes,
	Icon,
	ViewModeComponent: withDataSource(_ViewModeComponent as React.ComponentType<Props>),
	EditModeComponent: withEditorControls(withDataSource(_EditModeComponent as React.ComponentType<Props>)),
} as const satisfies Metadata
