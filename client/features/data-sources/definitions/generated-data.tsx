import { BlocksIcon } from "lucide-react"
import type { DataSourceInfo, DataSourceSettings } from "@/client/features/types"

const settings = [
	{
		id: "generate",
		type: "textarea",
		label: "JavaScript function to generate your data",
		placeholder: "Enter the function body",
		variant: "function-body",
		functionName: "generate",
		defaultValue: [],
	},
] as const satisfies ReadonlyArray<DataSourceInfo["settings"][number]>

async function tryConnection(componentDataSourceSettings: Readonly<DataSourceSettings>): Promise<unknown> {
	const generate = componentDataSourceSettings.generate
	const generateSource = Array.isArray(generate) ? generate.join("") : String(generate)
	if (!generateSource.trim()) {
		throw new Error("Expected generated data settings to provide a string function body")
	}

	const asyncGeneratorFn = new Function(`return (async () => { ${generateSource} })()`) as () => Promise<unknown>
	return asyncGeneratorFn()
}

export const dataSourceInfo = {
	id: "generated-data",
	label: "Generated Data",
	keywords: ["generated", "data"],
	Icon: <BlocksIcon className="h-4 w-4" />,
	settings,
	tryConnection,
} as const satisfies DataSourceInfo
