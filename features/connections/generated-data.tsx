import { BlocksIcon } from "lucide-react"
import type { ConnectionId } from "./types"

export const id: ConnectionId = "generated-data" as const

export const label = "Generated Data"

export const keywords = ["generated", "data"]

export const Icon = <BlocksIcon className="h-4 w-4" />

export const defaultSettings: ConnectionSettings = {
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

export type ConnectionSettings = {
	generate: string
}

export async function tryConnection(formData: ConnectionSettings): Promise<unknown> {
	let asyncGeneratorFn
	try {
		asyncGeneratorFn = new Function(`return (async () => { ${formData.generate} })()`);
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