import type { ConnectionSettings as RestConnectionSettings } from "./rest-api"
import type { ConnectionSettings as GeneratedDataConnectionSettings } from "./generated-data"
import { ReactNode } from "react"

export type ConnectionId = "rest-api" | "generated-data"

export type ConnectionSettings<ConnId extends ConnectionId> = ConnId extends "rest-api"
	? RestConnectionSettings
	: ConnId extends "generated-data"
	? GeneratedDataConnectionSettings
	: never

export type SettingsField<ConnId extends ConnectionId> = {
	id: keyof ConnectionSettings<ConnId>
	label: string
	type: "text" | "number" | "boolean" | "textarea"
	placeholder?: string
	options?: string[] // For select fields
}

export interface ConnectionInfo<ConnId extends ConnectionId> {
	id: ConnId
	label: string
	keywords: string[]
	defaultSettings: ConnectionSettings<ConnId>
	settingsFields: Record<keyof ConnectionSettings<ConnId>, SettingsField<ConnId>>
	Icon: ReactNode
}