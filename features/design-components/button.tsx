import { Button } from "@/components/ui/button"
import { withConnection } from "@/features/design-components/hoc/connected-component-hoc"
import { MousePointerClick } from "lucide-react"
import React from "react"
import { withEditorControls } from "./hoc/component-controls-hoc"
import { withTextEditing } from "./hoc/content-editable-hoc"
import type { Props, Attribute, Metadata } from "./types"

const tag = "button" as const

const label = "Button"

const keywords = ["button", "click", "action", "btn"]

const defaultChildren = ["Button"] as const

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
		setValue: (component, value: string) => ({ ...component, attributes: { ...component.attributes, id: value } } as Props["component"]),
	},
	{
		id: "content",
		type: "text",
		label: "Content",
		placeholder: "Enter button text",
		defaultValue: "",
		getValue: (component) => {
			if (!component.children) return ""
			if (Array.isArray(component.children)) {
				return component.children.map(child => typeof child === "string" ? child : "").join("")
			}
			return typeof component.children === "string" ? component.children : ""
		},
		setValue: (component, value: unknown) => ({ ...component, children: Array.isArray(value) ? value : [value] } as Props["component"]),
	},
]

const attributesMap = Object.fromEntries((attributes).map((s) => [s.id, s]))

const Icon = <MousePointerClick className="h-4 w-4" />

const Component = (props: Props) => {
	const children = props.component.children?.length ? props.component.children : attributesMap.content.defaultValue
	const filteredProps: Partial<Props> = { ...props }
	delete (filteredProps as any).pageBuilderMode
	delete (filteredProps as any).selectedComponentId

	return (
		<Button {...filteredProps}>{children as React.ReactNode}</Button>
	)
}

const WithContentEditing = withTextEditing(Component)
const ViewModeComponent = withConnection(WithContentEditing)
const EditModeComponent = withEditorControls(ViewModeComponent)

export const metadata: Metadata = {
	tag,
	label,
	keywords,
	defaultChildren,
	attributes,
	Icon,
	ViewModeComponent,
	EditModeComponent,
}