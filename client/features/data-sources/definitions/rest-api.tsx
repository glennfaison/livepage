import { Plug } from "lucide-react"
import type { DataSourceInfo, DataSourceSettings } from "@/client/features/types"
import { validateUrlForSsrf } from "@/client/lib/utils"
import { JSONPath } from "jsonpath-plus"

const settings = [
	{
		id: "url",
		type: "textarea",
		label: "REST API URL",
		placeholder: "Enter the REST API URL",
		defaultValue: [],
	},
	{
		id: "parse-result",
		type: "textarea",
		label: "JSONPath expression to parse your results",
		placeholder: "$.data.items[*] (leave empty to use raw response)",
		defaultValue: [],
	},
] as const satisfies ReadonlyArray<DataSourceInfo["settings"][number]>

function evaluateJsonPath(data: unknown, expression: string): unknown {
	try {
		const results = JSONPath({ path: expression, json: data, wrap: false }) as unknown[]
		return results.length === 1 ? results[0] : results
	} catch (error) {
		throw new Error(`Invalid JSONPath expression: ${error instanceof Error ? error.message : String(error)}`)
	}
}

async function tryConnection(componentDataSourceSettings: Readonly<DataSourceSettings>): Promise<unknown> {
	const urlValue = componentDataSourceSettings.url
	const url = Array.isArray(urlValue) ? urlValue.join("") : String(urlValue)
	if (!url.trim()) {
		throw new Error("Expected REST API settings to provide a URL string")
	}

	const validation = validateUrlForSsrf(url.trim())
	if (!validation.valid) {
		throw new Error(validation.error ?? "Invalid URL")
	}

	const parseResult = componentDataSourceSettings["parse-result"]
	const parseResultSource = Array.isArray(parseResult) ? parseResult.join("") : String(parseResult)
	const jsonPathExpression = parseResultSource.trim()

	const result = await fetch(url)
	if (!result.ok) {
		throw await result.json()
	}
	const unparsedData = await result.json()

	return jsonPathExpression ? evaluateJsonPath(unparsedData, jsonPathExpression) : unparsedData
}

export const dataSourceInfo = {
	id: "rest-api",
	label: "REST API",
	keywords: ["rest", "api"],
	Icon: <Plug className="h-4 w-4" />,
	settings,
	tryConnection,
} as const satisfies DataSourceInfo
