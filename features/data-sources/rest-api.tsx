import { Plug } from "lucide-react"
import type { DataSourceId } from "./types"

export const id: DataSourceId = "rest-api" as const

export const label = "REST API"

export const keywords = ["rest", "api"]

export const Icon = <Plug className="h-4 w-4" />

export const defaultSettings: DataSourceSettings = {
	url: "",
	"parse-result": "",
}

export const settingsFields = {
	url: {
		id: "url",
		type: "textarea",
		label: "REST API URL",
		placeholder: "Enter the REST API URL",
	},
	"parse-result": {
		id: "parse-result",
		type: "textarea",
		label: "JavaScript function to parse your results",
		placeholder: "Enter the function body",
	},
}

export type DataSourceSettings = {
	url: string
	"parse-result": string
}

export async function tryConnection(componentDataSourceSettings: DataSourceSettings): Promise<unknown> {
	let parseResultFn
	try {
		if (!!componentDataSourceSettings["parse-result"].trim()){
			parseResultFn = new Function(componentDataSourceSettings["parse-result"])
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