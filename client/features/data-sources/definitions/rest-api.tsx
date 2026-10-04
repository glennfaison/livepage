import { Plug } from "lucide-react"
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
		id: "parse-result",
		type: "textarea",
		label: "JavaScript function to parse your results",
		placeholder: "Enter the function body",
		variant: "function-body",
		functionName: "parse",
		functionParameters: "data",
		defaultValue: [],
	},
] as const satisfies ReadonlyArray<DataSourceInfo["settings"][number]>

async function tryConnection(componentDataSourceSettings: Readonly<DataSourceSettings>): Promise<unknown> {
	const urlValue = componentDataSourceSettings.url
	const url = Array.isArray(urlValue) ? urlValue.join("") : String(urlValue)
	if (!url.trim()) {
		throw new Error("Expected REST API settings to provide a URL string")
	}

	const parseResult = componentDataSourceSettings["parse-result"]
	const parseResultSource = Array.isArray(parseResult) ? parseResult.join("") : String(parseResult)
	const parseResultFn = parseResultSource.trim()
		? new Function("data", parseResultSource) as (data: unknown) => unknown
		: undefined

	const result = await fetch(url)
	if (!result.ok) {
		throw await result.json()
	}
	const unparsedData = await result.json()

	return parseResultFn ? parseResultFn(unparsedData) : unparsedData
}

export const dataSourceInfo = {
	id: "rest-api",
	label: "REST API",
	keywords: ["rest", "api"],
	Icon: <Plug className="h-4 w-4" />,
	settings,
	tryConnection,
} as const satisfies DataSourceInfo
