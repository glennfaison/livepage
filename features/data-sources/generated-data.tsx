import { BlocksIcon } from "lucide-react"
import type { DataSourceInfo, DataSourceSettings } from "@/features/types"

const settings = [
	{
		id: "generate",
		type: "textarea",
		label: "JavaScript function to generate your data",
		placeholder: "Enter the function body",
		defaultValue: [],
	},
] as const satisfies ReadonlyArray<DataSourceInfo["settings"][number]>

async function tryConnection(componentDataSourceSettings: Readonly<DataSourceSettings>): Promise<unknown> {
	const generate = componentDataSourceSettings.generate
	const generateSource = Array.isArray(generate) ? generate.join("") : String(generate)
	if (!generateSource.trim()) {
		throw new Error("Expected generated data settings to provide a string function body")
	}

	let asyncGeneratorFn
	try {
		asyncGeneratorFn = new Function(`return (async () => { ${generateSource} })()`)
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
