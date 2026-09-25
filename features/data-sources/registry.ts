import type { DataSourceId, DataSourceInfo, DataSourceInfoMap, DataSourceSettings } from "@/features/types"
import { dataSourceInfo as RestApi } from "./definitions/rest-api"
import { dataSourceInfo as GeneratedData } from "./definitions/generated-data"
import { dataSourceInfo as RssFeed } from "./definitions/rss-feed"
import { dataSourceInfo as GraphQL } from "./definitions/graphql"
import { dataSourceInfo as JsonFeed } from "./definitions/json-feed"
import { dataSourceInfo as Csv } from "./definitions/csv"

export const dataSourceIdList = [
	RestApi.id,
	GeneratedData.id,
	RssFeed.id,
	GraphQL.id,
	JsonFeed.id,
	Csv.id,
] as const

const dataSourceMap: DataSourceInfoMap = {
	[RestApi.id]: RestApi,
	[GeneratedData.id]: GeneratedData,
	[RssFeed.id]: RssFeed,
	[GraphQL.id]: GraphQL,
	[JsonFeed.id]: JsonFeed,
	[Csv.id]: Csv,
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
