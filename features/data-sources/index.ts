import type { DataSourceId, DataSourceInfo, DataSourceSettings } from "./types";
import * as RestApi from "./rest-api"
import * as GeneratedData from "./generated-data"

export const dataSourceIdList = [
	"rest-api",
	"generated-data",
] as const

export function getDataSourceInfo<DsId extends DataSourceId>(connectionId: DsId): DataSourceInfo<DsId> {
	switch (connectionId) {
		case "rest-api":
			return RestApi
		case "generated-data":
			return GeneratedData
		default:
			const _unexpected: never = connectionId
			throw new Error(`Unknown data source: ${_unexpected}`)
	}
}

export function encodeDataSourceSettings(dataSourceSettings: {
	id: DataSourceId
	settings: DataSourceSettings<DataSourceId>
}) {
	const connectionDataString = JSON.stringify(dataSourceSettings)
	const base64 = Buffer.from(connectionDataString, "utf8").toString("base64")
	return base64
}

export function decodeDataSourceSettings(encodedDataSourceSettings: string): {
	id: DataSourceId
	settings: DataSourceSettings<DataSourceId>
} {
	if (typeof encodedDataSourceSettings !== "string") {
		return {} as {id: DataSourceId; settings: DataSourceSettings<DataSourceId>}
	}
	try {
		const jsonString = Buffer.from(encodedDataSourceSettings, "base64").toString("utf8")
		return JSON.parse(jsonString)
	} catch (error) {
		throw error
	}
}