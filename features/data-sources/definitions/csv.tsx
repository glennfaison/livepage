import { Table2 } from "lucide-react"
import type { DataSourceInfo, DataSourceSettings } from "@/features/types"

const settings = [
	{
		id: "url",
		type: "textarea",
		label: "CSV URL",
		placeholder: "https://example.com/data.csv",
		defaultValue: [],
	},
] as const satisfies ReadonlyArray<DataSourceInfo["settings"][number]>

function parseCsv(input: string): string[][] {
	const rows: string[][] = []
	let row: string[] = []
	let cell = ""
	let quoted = false
	for (let index = 0; index < input.length; index += 1) {
		const character = input[index]
		if (character === '"') {
			if (quoted && input[index + 1] === '"') { cell += '"'; index += 1 } else quoted = !quoted
		} else if (character === "," && !quoted) { row.push(cell.trim()); cell = "" } else if ((character === "\n" || character === "\r") && !quoted) {
			if (character === "\r" && input[index + 1] === "\n") index += 1
			row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ""
		} else cell += character
	}
	row.push(cell.trim()); if (row.some(Boolean)) rows.push(row)
	return rows
}

async function tryConnection(componentDataSourceSettings: Readonly<DataSourceSettings>): Promise<unknown> {
	const raw = componentDataSourceSettings.url
	const url = (Array.isArray(raw) ? raw.join("") : String(raw ?? "")).trim()
	if (!url) throw new Error("Expected CSV settings to provide a URL string")
	const result = await fetch(url, { headers: { accept: "text/csv, text/plain" } })
	if (!result.ok) throw new Error(`CSV request failed with status ${result.status}`)
	const rows = parseCsv(await result.text())
	if (rows.length === 0) return { columns: [], rows: [] }
	const [columns, ...data] = rows
	return { columns, rows: data.map((row) => Object.fromEntries(columns.map((column, index) => [column, row[index] ?? ""]))) }
}

export const dataSourceInfo = {
	id: "csv",
	label: "CSV",
	keywords: ["csv", "table", "spreadsheet", "data"],
	Icon: <Table2 className="h-4 w-4" />,
	settings,
	tryConnection,
} as const satisfies DataSourceInfo
