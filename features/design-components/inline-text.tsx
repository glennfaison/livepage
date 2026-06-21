import { withConnection } from "@/features/design-components/hoc/connected-component-hoc"
import { Type } from "lucide-react"
import React from "react"
import { withEditorControls } from "./hoc/component-controls-hoc"
import { withTextEditing } from "./hoc/content-editable-hoc"
import type { Props, DesignComponentTag, DesignComponent, Metadata } from "./types"

export type ComponentAttributes = {
	id: string
}

export const tag: DesignComponentTag = "inline-text" as const

const label = "Inline Text"

const keywords = ["span", "text", "inline", "content"]

const defaultChildren = ["Inline text."] as const

const settings = [
	{
		id: "id",
		type: "text",
		label: "ID",
		readOnly: true,
		disabled: true,
		placeholder: "ID",
		defaultValue: "",
		getValue: (component: DesignComponent<typeof tag>) => component.attributes.id || "",
		setValue: (component: DesignComponent<typeof tag>, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, id: value } };
		},
	},
	{
		id: "content",
		type: "text",
		label: "Content",
		placeholder: "Enter inline text",
		defaultValue: defaultChildren,
		getValue: (component: DesignComponent<typeof tag>) => component.children,
		setValue: (component: DesignComponent<typeof tag>, value: unknown) => {
			return { ...component, children: Array.isArray(value) ? value : [value], }
		},
	},
]

const settingsMap = Object.fromEntries((settings as any).filter((s:any)=> (s as any).type !== "divider").map((s:any) => [(s as any).id, s])) as any

const defaultAttributes = {
	id: settingsMap.id.defaultValue,
} as const

const Icon = <Type className="h-4 w-4" />

const Component_ = (props: Props<typeof tag>) => {
	const children = props.component.children?.length ? props.component.children : settingsMap.content.defaultValue
	const filteredProps: Partial<Props<typeof tag>> = { ...props }
	delete filteredProps.pageBuilderMode
	delete filteredProps.selectedComponentId

	return (
		<span className="inline" {...filteredProps}>{children as React.ReactNode}</span>
	)
}

const WithContentEditing = withTextEditing(Component_)
const ConnectedComponent = withConnection(WithContentEditing)
const EditModeComponent = withEditorControls(ConnectedComponent)

export const metadata: Metadata<typeof tag> = {
	tag,
	label,
	keywords,
	defaultChildren: defaultChildren,
	defaultAttributes: defaultAttributes as any,
	attributes: settings as any,
	Icon,
	ViewModeComponent: ConnectedComponent,
	EditModeComponent,
}