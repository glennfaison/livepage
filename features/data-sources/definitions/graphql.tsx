import { Network } from "lucide-react"
import type { DataSourceInfo, DataSourceSettings } from "@/features/types"

const settings = [
	{
		id: "url",
		type: "textarea",
		label: "GraphQL endpoint URL",
		placeholder: "https://api.example.com/graphql",
		defaultValue: [],
	},
	{
		id: "query",
		type: "textarea",
		label: "GraphQL query",
		placeholder: "query { items { id title } }",
		rows: 8,
		defaultValue: [],
	},
	{
		id: "variables",
		type: "textarea",
		label: "Variables (JSON)",
		placeholder: '{"limit": 10}',
		rows: 4,
		defaultValue: [],
	},
] as const satisfies ReadonlyArray<DataSourceInfo["settings"][number]>

function value(settings: DataSourceSettings, id: string): string {
	const raw = settings[id]
	return Array.isArray(raw) ? raw.join("") : String(raw ?? "")
}

async function tryConnection(componentDataSourceSettings: Readonly<DataSourceSettings>): Promise<unknown> {
	const url = value(componentDataSourceSettings, "url").trim()
	const query = value(componentDataSourceSettings, "query").trim()
	if (!url || !query) throw new Error("GraphQL settings require an endpoint URL and query")

	let variables: unknown = {}
	const variablesSource = value(componentDataSourceSettings, "variables").trim()
	if (variablesSource) {
		try {
			variables = JSON.parse(variablesSource)
		} catch {
			throw new Error("GraphQL variables must be valid JSON")
		}
	}

	const result = await fetch(url, {
		method: "POST",
		headers: { "content-type": "application/json", accept: "application/json" },
		body: JSON.stringify({ query, variables }),
	})
	if (!result.ok) throw new Error(`GraphQL request failed with status ${result.status}`)
	const payload = await result.json()
	if (Array.isArray(payload.errors) && payload.errors.length > 0) {
		throw new Error(payload.errors.map((error: { message?: string }) => error.message ?? "GraphQL error").join("; "))
	}
	return payload.data
}

export const dataSourceInfo = {
	id: "graphql",
	label: "GraphQL",
	keywords: ["graphql", "api", "query"],
	Icon: <Network className="h-4 w-4" />,
	settings,
	tryConnection,
} as const satisfies DataSourceInfo
