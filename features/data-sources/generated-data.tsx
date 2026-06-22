import { BlocksIcon } from "lucide-react"
import type { DataSourceInfo } from "./types"

const settings = [
	{
		id: "generate",
		type: "textarea",
		label: "JavaScript function to generate your data",
		placeholder: "Enter the function body",
		defaultValue: "",
	},
] as const satisfies ReadonlyArray<DataSourceInfo["settings"][number]>

async function tryConnection(componentDataSourceSettings: Readonly<Record<string, string>>): Promise<unknown> {
	let asyncGeneratorFn
	try {
		asyncGeneratorFn = new Function(`return (async () => { ${componentDataSourceSettings.generate} })()`)
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

export const dataSourceInfo = {
	id: "generated-data",
	label: "Generated Data",
	keywords: ["generated", "data"],
	Icon: <BlocksIcon className="h-4 w-4" />,
	settings,
	tryConnection,
} as const satisfies DataSourceInfo

