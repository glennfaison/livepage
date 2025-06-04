import type { DataSourceSettings as RestConnectionSettings } from "./rest-api"
import type { DataSourceSettings as GeneratedDataConnectionSettings } from "./generated-data"
import { ReactNode } from "react"

export type DataSourceId = "rest-api" | "generated-data"

export type DataSourceSettings<DsId extends DataSourceId> = DsId extends "rest-api"
	? RestConnectionSettings
	: DsId extends "generated-data"
	? GeneratedDataConnectionSettings
	: never

export type SettingsField<DsId extends DataSourceId> = {
	id: keyof DataSourceSettings<DsId>
	label: string
	type: "text" | "number" | "boolean" | "textarea"
	placeholder?: string
	options?: string[] // For select fields
}

export interface DataSourceInfo<DsId extends DataSourceId> {
	id: DsId
	label: string
	keywords: string[]
	defaultSettings: DataSourceSettings<DsId>
	settingsFields: Record<keyof DataSourceSettings<DsId>, SettingsField<DsId>>
	Icon: ReactNode
	tryConnection: (componentDataSourceSettings: DataSourceSettings<DsId>) => Promise<unknown>
}