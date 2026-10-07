import type { DataSourceId, DataSourceInfo, DataSourceInfoMap, DataSourceSettings } from "@/client/features/types"
import { dataSourceInfo as RestApi } from "./definitions/rest-api"
import { dataSourceInfo as GeneratedData } from "./definitions/generated-data"
import { dataSourceInfo as RssFeed } from "./definitions/rss-feed"
import { dataSourceInfo as GraphQL } from "./definitions/graphql"
import { dataSourceInfo as JsonFeed } from "./definitions/json-feed"
import { dataSourceInfo as Csv } from "./definitions/csv"
import { dataSourceInfo as LinkedInProfile } from "./definitions/linkedin-profile"
import { decodeBrowserDataSourceSettings } from "./browser-core"

export const dataSourceIdList = [
	RestApi.id,
	GeneratedData.id,
	RssFeed.id,
	GraphQL.id,
	JsonFeed.id,
	Csv.id,
	LinkedInProfile.id,
] as const

const dataSourceMap: DataSourceInfoMap = {
	[RestApi.id]: RestApi,
	[GeneratedData.id]: GeneratedData,
	[RssFeed.id]: RssFeed,
	[GraphQL.id]: GraphQL,
	[JsonFeed.id]: JsonFeed,
	[Csv.id]: Csv,
	[LinkedInProfile.id]: LinkedInProfile,
}

/**
 * Retrieves data source info by its ID.
 *
 * @param connectionId - The data source ID to look up
 * @returns DataSourceInfo if found, undefined otherwise
 */
export function getDataSourceInfo(connectionId: DataSourceId): DataSourceInfo | undefined {
	return dataSourceMap[connectionId]
}

/**
 * Encodes data source settings (ID + settings object) as a base64 string
 * for storage in component attributes.
 *
 * @param dataSourceSettings - Object containing the data source ID and settings
 * @returns Base64-encoded string
 */
export function encodeDataSourceSettings(dataSourceSettings: {
	id: DataSourceId
	settings: DataSourceSettings
}) {
	const connectionDataString = JSON.stringify(dataSourceSettings)
	const base64 = Buffer.from(connectionDataString, "utf8").toString("base64")
	return base64
}

/**
 * Decodes a base64-encoded data source settings string back into its
 * component ID and settings object.
 *
 * @param encodedDataSourceSettings - Base64-encoded settings string
 * @returns Object with id and settings, or empty object if invalid
 */
export function decodeDataSourceSettings(encodedDataSourceSettings: string): {
	id: DataSourceId
	settings: DataSourceSettings
} {
	if (typeof encodedDataSourceSettings !== "string" || encodedDataSourceSettings === "") {
		return {} as {id: DataSourceId; settings: DataSourceSettings}
	}
	const decoded = decodeBrowserDataSourceSettings(encodedDataSourceSettings)
	if (!decoded) throw new Error("Invalid data-source settings")
	return {
		id: decoded.id,
		settings: decoded.settings as DataSourceSettings,
	}
}
