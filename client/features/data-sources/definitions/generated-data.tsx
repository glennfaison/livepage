import { BlocksIcon } from "lucide-react"
import type { DataSourceInfo, DataSourceSettings } from "@/client/features/types"
import { z } from "zod"

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

/**
 * Zod schema for generated-data settings. It is the single source of truth for
 * the settings shape: TypeScript types are inferred from it (`z.infer`) so
 * settings are type-checked at compile time with no hand-written duplicate of
 * the schema's types. The schema is exported for consumers who want to validate
 * settings at runtime without changing `tryConnection`'s existing behavior.
 */
export const generatedDataSettingsSchema = z.object({
	generate: z.union([z.string(), z.array(z.string())]),
})

/**
 * Settings type derived from the zod schema rather than hand-written.
 */
export type GeneratedDataSettings = z.infer<typeof generatedDataSettingsSchema>

/**
 * Result type of executing the user-provided generator function. The output is
 * inherently dynamic (user code), so it is `unknown`; callers narrow it before
 * use.
 */
export type GeneratedDataResult = unknown

async function tryConnection(componentDataSourceSettings: Readonly<DataSourceSettings>): Promise<unknown> {
	const typedSettings = componentDataSourceSettings as unknown as Readonly<GeneratedDataSettings>
	const generate = typedSettings.generate
	const generateSource = Array.isArray(generate) ? generate.join("") : String(generate)
	if (!generateSource.trim()) {
		throw new Error("Expected generated data settings to provide a string function body")
	}

	const asyncGeneratorFn = new Function(`return (async () => { ${generateSource} })()`) as () => Promise<GeneratedDataResult>
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
