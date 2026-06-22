import type { DataSourceId, DataSourceInfo, DataSourceInfoMap, DataSourceSettings } from "./types"
import { dataSourceInfo as RestApi } from "./rest-api"
import { dataSourceInfo as GeneratedData } from "./generated-data"

export const dataSourceIdList = [
	RestApi.id,
	GeneratedData.id,
] as const

const dataSourceMap: DataSourceInfoMap = {
	[RestApi.id]: RestApi,
	[GeneratedData.id]: GeneratedData,
}

export function getDataSourceInfo(connectionId: DataSourceId): DataSourceInfo | undefined {
	return dataSourceMap[connectionId]
}

export function encodeDataSourceSettings(dataSourceSettings: {
	id: DataSourceId
	settings: DataSourceSettings
}) {
	const connectionDataString = JSON.stringify(dataSourceSettings)
	const base64 = Buffer.from(connectionDataString, "utf8").toString("base64")
	return base64
}

export function decodeDataSourceSettings(encodedDataSourceSettings: string): {
	id: DataSourceId
	settings: DataSourceSettings
} {
	if (typeof encodedDataSourceSettings !== "string" || encodedDataSourceSettings === "") {
		return {} as {id: DataSourceId; settings: DataSourceSettings}
	}
	try {
		const jsonString = Buffer.from(encodedDataSourceSettings, "base64").toString("utf8")
		return JSON.parse(jsonString)
	} catch (error) {
		throw error
	}
}

