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