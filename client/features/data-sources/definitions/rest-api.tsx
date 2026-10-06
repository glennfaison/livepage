import { Plug } from "lucide-react"
import { JSONPath } from "./jsonpath-wrapper"
import type { DataSourceInfo, DataSourceSettings } from "@/client/features/types"

const settings = [
	{
		id: "url",
		type: "textarea",
		label: "REST API URL",
		placeholder: "Enter the REST API URL",
		defaultValue: [],
	},
	{
		id: "jsonpath",
		type: "textarea",
		label: "JSONPath expression to extract data",
		placeholder: "$.items[*] or $.data.users[?(@.active==true)]",
		defaultValue: [],
	},
] as const satisfies ReadonlyArray<DataSourceInfo["settings"][number]>

async function tryConnection(componentDataSourceSettings: Readonly<DataSourceSettings>): Promise<unknown> {
	const urlValue = componentDataSourceSettings.url
	const url = Array.isArray(urlValue) ? urlValue.join("") : String(urlValue)
	if (!url.trim()) {
		throw new Error("Expected REST API settings to provide a URL string")
	}

	const jsonpathValue = componentDataSourceSettings.jsonpath
	const jsonpathExpression = Array.isArray(jsonpathValue) ? jsonpathValue.join("") : String(jsonpathValue)

	const result = await fetch(url)
	if (!result.ok) {
		throw await result.json()
	}
	const unparsedData = await result.json()

	if (!jsonpathExpression.trim()) {
		return unparsedData
	}

	try {
		const extractedData = JSONPath({ path: jsonpathExpression, json: unparsedData })
		return extractedData
	} catch (error) {
		throw new Error(`Invalid JSONPath expression: ${error instanceof Error ? error.message : String(error)}`)
	}
}

export const dataSourceInfo = {
	id: "rest-api",
	label: "REST API",
	keywords: ["rest", "api"],
	Icon: <Plug className="h-4 w-4" />,
	settings,
	tryConnection,
} as const satisfies DataSourceInfo
