import { Plug } from "lucide-react"
import type { DataSourceInfo } from "./types"

const settings = [
	{
		id: "url",
		type: "textarea",
		label: "REST API URL",
		placeholder: "Enter the REST API URL",
		defaultValue: "",
	},
	{
		id: "parse-result",
		type: "textarea",
		label: "JavaScript function to parse your results",
		placeholder: "Enter the function body",
		defaultValue: "",
	},
] as const satisfies ReadonlyArray<DataSourceInfo["settings"][number]>

async function tryConnection(componentDataSourceSettings: Readonly<Record<string, string>>): Promise<unknown> {
	let parseResultFn
	try {
		if (componentDataSourceSettings["parse-result"].trim()) {
			parseResultFn = new Function("data", `${componentDataSourceSettings["parse-result"]}`)
		}
	} catch (error) {
		throw error
	}

	let unparsedData
	try {
		const result = await fetch(componentDataSourceSettings.url)
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

