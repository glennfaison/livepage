import { Plug } from "lucide-react"
import type { DataSourceInfo, DataSourceSettings } from "@/features/types"

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
		defaultValue: [],
	},
] as const satisfies ReadonlyArray<DataSourceInfo["settings"][number]>

async function tryConnection(componentDataSourceSettings: Readonly<DataSourceSettings>): Promise<unknown> {
	const urlValue = componentDataSourceSettings.url
	const url = Array.isArray(urlValue) ? urlValue.join("") : String(urlValue)
	if (!url.trim()) {
		throw new Error("Expected REST API settings to provide a URL string")
	}

	let parseResultFn
	try {
		const parseResult = componentDataSourceSettings["parse-result"]
		const parseResultSource = Array.isArray(parseResult) ? parseResult.join("") : String(parseResult)
		if (parseResultSource.trim()) {
			parseResultFn = new Function("data", `${parseResultSource}`)
		}
	} catch (error) {
		throw error
	}

	let unparsedData
	try {
		const result = await fetch(url)
		if (!result.ok) {
			throw await result.json()
		}
		unparsedData = await result.json()
	} catch (error) {
		throw error
	}

	if (!parseResultFn) {
		return unparsedData
	}

	try {
		return parseResultFn(unparsedData)
	} catch (error) {
		throw error
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
