import React, { useCallback } from "react"
import { AlignVerticalSpaceBetween, Plus } from "lucide-react"
import type { Props, Attribute, Metadata, ViewModeProps, EditModeProps } from "./types"
import { ComponentSelectorPopover } from "@/components/page-builder/component-selector-popover"
import { useDividerVisibility, Divider } from "@/components/page-builder/layout-divider"
import { Button } from "@/components/ui/button"
import { cn, intersperseAndAppend } from "@/lib/utils"
import { getComponentInfo, componentTagList } from "."
import { withConnection } from "@/features/design-components/hoc/connected-component-hoc"
import { withEditorControls } from "./hoc/component-controls-hoc"
import { useComponentOperationsContext } from "@/lib/component-operations-context"

const tag = "column" as const

const label = "Column"

const keywords = ["column", "col", "container", "layout", "vertical"]

const attributes: Attribute[] = [
	{
		id: "id",
		type: "text",
		label: "ID",
		readOnly: true,
		disabled: true,
		placeholder: "ID",
		defaultValue: "",
		getValue: (component) => component.attributes.id || "",
		setValue: (component, value: string) => {
			return { ...component, attributes: { ...component.attributes, id: value } } as Props["component"];
		},
	},
	{
		id: "padding-top",
		type: "text",
		label: "Padding Top",
		placeholder: "Padding Top",
		defaultValue: "0",
		getValue: (component) => component.attributes["padding-top"] || "",
		setValue: (component, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, ["padding-top"]: value } } as Props["component"];
		},
	},
	{
		id: "padding-right",
		type: "text",
		label: "Padding Right",
		placeholder: "Padding Right",
		defaultValue: "0",
		getValue: (component) => component.attributes["padding-right"] || "",
		setValue: (component, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, ["padding-right"]: value } } as Props["component"];
		},
	},
	{
		id: "padding-bottom",
		type: "text",
		label: "Padding Bottom",
		placeholder: "Padding Bottom",
		defaultValue: "0",
		getValue: (component) => component.attributes["padding-bottom"] || "",
		setValue: (component, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, ["padding-bottom"]: value } } as Props["component"];
		},
	},
	{
		id: "padding-left",
		type: "text",
		label: "Padding Left",
		placeholder: "Padding Left",
		defaultValue: "0",
		getValue: (component) => component.attributes["padding-left"] || "",
		setValue: (component, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, ["padding-left"]: value } } as Props["component"];
		},
	},
	{
		id: "margin-top",
		type: "text",
		label: "Margin Top",
		placeholder: "Margin Top",
		defaultValue: "0",
		getValue: (component) => component.attributes["margin-top"] || "",
		setValue: (component, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, ["margin-top"]: value } } as Props["component"];
		},
	},
	{
		id: "margin-right",
		type: "text",
		label: "Margin Right",
		placeholder: "Margin Right",
		defaultValue: "0",
		getValue: (component) => component.attributes["margin-right"] || "",
		setValue: (component, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, ["margin-right"]: value } } as Props["component"];
		},
	},
	{
		id: "margin-bottom",
		type: "text",
		label: "Margin Bottom",
		placeholder: "Margin Bottom",
		defaultValue: "0",
		getValue: (component) => component.attributes["margin-bottom"] || "",
		setValue: (component, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, ["margin-bottom"]: value } } as Props["component"];
		},
	},
	{
		id: "margin-left",
		type: "text",
		label: "Margin Left",
		placeholder: "Margin Left",
		defaultValue: "0",
		getValue: (component) => component.attributes["margin-left"] || "",
		setValue: (component, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, ["margin-left"]: value } } as Props["component"];
		},
	},
]

const attributesMap = Object.fromEntries((attributes).map((s) => [s.id, s]))

const Icon = <AlignVerticalSpaceBetween className="h-4 w-4 bg-gray-200 rounded" />

const _ViewModeComponent = (props: ViewModeProps) => {
	const { component } = props
	const attributes = component.attributes
	const padding = {
		top: attributes["padding-top"] || attributesMap["padding-top"].defaultValue,
		right: attributes["padding-right"] || attributesMap["padding-right"].defaultValue,
		bottom: attributes["padding-bottom"] || attributesMap["padding-bottom"].defaultValue,
		left: attributes["padding-left"] || attributesMap["padding-left"].defaultValue,
	}
	const margin = {
		top: attributes["margin-top"] || attributesMap["margin-top"].defaultValue,
		right: attributes["margin-right"] || attributesMap["margin-right"].defaultValue,
		bottom: attributes["margin-bottom"] || attributesMap["margin-bottom"].defaultValue,
		left: attributes["margin-left"] || attributesMap["margin-left"].defaultValue,
	}

	const childComponents = component.children.map((child) => {
		if (typeof child === "string") return child
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
			className={cn("min-h-[50px] flex flex-col justify-center", "p-0 gap-0")}
			{...attributes}
			style={{
				padding: `${padding.top} ${padding.right} ${padding.bottom} ${padding.left}`,
				margin: `${margin.top} ${margin.right} ${margin.bottom} ${margin.left}`,
			}}
		>
			{childComponents}
		</div>
	);
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
	const padding = {
		top: attributes["padding-top"] || attributesMap["padding-top"].defaultValue,
		right: attributes["padding-right"] || attributesMap["padding-right"].defaultValue,
		bottom: attributes["padding-bottom"] || attributesMap["padding-bottom"].defaultValue,
		left: attributes["padding-left"] || attributesMap["padding-left"].defaultValue,
	}
	const margin = {
		top: attributes["margin-top"] || attributesMap["margin-top"].defaultValue,
		right: attributes["margin-right"] || attributesMap["margin-right"].defaultValue,
		bottom: attributes["margin-bottom"] || attributesMap["margin-bottom"].defaultValue,
		left: attributes["margin-left"] || attributesMap["margin-left"].defaultValue,
	}
	const hasChildren = !!component.children.length
	const { addComponent } = useComponentOperationsContext()
	const {
		visibleHorizontalDividers,
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

	const WrappedChilden = intersperseAndAppend(children, null).map((item, index) => {
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

	return (
		<div
			className={cn(
				"min-h-[50px] flex flex-col justify-center",
				"p-0 gap-0",
				"border border-dashed border-gray-300",
			)}
			{...attributes}
			style={{
				padding: `${padding.top} ${padding.right} ${padding.bottom} ${padding.left}`,
				margin: `${margin.top} ${margin.right} ${margin.bottom} ${margin.left}`,
			}}
		>
			{hasChildren ? WrappedChilden : <EmptyColumnContent onAddChildComponent={onAddChildComponent} />}
		</div>
	);
}

export const componentMetadata = {
	tag,
	label,
	keywords,
	defaultChildren: [],
	attributes,
	Icon,
	ViewModeComponent: withConnection(_ViewModeComponent),
	EditModeComponent: withEditorControls(withConnection(_EditModeComponent)),
} as const satisfies Metadata