import type { ReactNode } from "react"

export type DataSourceId = string

export type DataSourceSettings = Readonly<Record<string, string>>

export type SettingsField = Readonly<{
	readonly id: string
	readonly label: string
	readonly type: "text" | "number" | "boolean" | "textarea"
	readonly placeholder?: string
	readonly options?: ReadonlyArray<string>
	readonly defaultValue: string
}>

export interface DataSourceInfo {
	readonly id: DataSourceId
	readonly label: string
	readonly keywords: ReadonlyArray<string>
	readonly settings: ReadonlyArray<SettingsField>
	readonly Icon: ReactNode
	readonly tryConnection: (componentDataSourceSettings: Readonly<DataSourceSettings>) => Promise<unknown>
}

export type DataSourceInfoMap = Readonly<Record<DataSourceId, DataSourceInfo>>

