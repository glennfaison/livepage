import type { ConnectionId } from "./types";
import * as RestApi from "./rest-api"
import * as GeneratedData from "./generated-data"

export const connectionIdList = [
	"rest-api",
	"generated-data",
] as const

export function getConnectionInfo(connectionId: ConnectionId) {
	switch (connectionId) {
		case "rest-api":
			return RestApi
		case "generated-data":
			return GeneratedData
		default:
			const _unexpected: never = connectionId
			throw new Error(`Unknown component type: ${_unexpected}`)
	}
}

export function encodeConnectionData(connectionData: object) {
	const connectionDataString = JSON.stringify(connectionData)
	const base64 = Buffer.from(connectionDataString, "utf8").toString("base64")
	return base64
}

export function decodeConnectionData(encodedData: string) {
	if (typeof encodedData !== "string") {
		return {}
	}
		const jsonString = Buffer.from(encodedData, "base64").toString("utf8")
	return JSON.parse(jsonString)
}