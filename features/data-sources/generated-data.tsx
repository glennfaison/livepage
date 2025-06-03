import { BlocksIcon } from "lucide-react"
import type { DataSourceId } from "./types"

export const id: DataSourceId = "generated-data" as const

export const label = "Generated Data"

export const keywords = ["generated", "data"]

export const Icon = <BlocksIcon className="h-4 w-4" />

export const defaultSettings: DataSourceSettings = {
	"generate": "",
}

export const settingsFields = {
	"generate": {
		id: "generate",
		type: "textarea",
		label: "JavaScript function to generate your data",
		placeholder: "Enter the function body",
	},
}

export type DataSourceSettings = {
	generate: string
}

export async function tryConnection(componentDataSourceSettings: DataSourceSettings): Promise<unknown> {
	let asyncGeneratorFn
	try {
		asyncGeneratorFn = new Function(`return (async () => { ${componentDataSourceSettings.generate} })()`);
	} catch (error) {
		throw error
	}
	try {
		const result = await asyncGeneratorFn()
		return result
	} catch (error) {
		throw error
	}
}