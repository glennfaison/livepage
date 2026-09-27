import React from "react"
import { Table2 } from "lucide-react"
import { withDataSource } from "@/features/data-sources"
import { withEditorControls } from "@/features/page-builder/editor-controls"
import type { Metadata, Props, SettingsField } from "@/features/types"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createTextAttribute, readCustomClasses } from "@/features/design-component-runtime/primitives"
import { cn } from "@/lib/utils"

const tag = "data-table" as const
const label = "Data Table"
const keywords = ["table", "data table", "list", "rows", "diagnostic", "grid"]

const defaultColumns = ["Column 1", "Column 2", "Column 3"] as const
const defaultRows = [
  ["Row 1 value A", "Row 1 value B", "Row 1 value C"],
  ["Row 2 value A", "Row 2 value B", "Row 2 value C"],
] as const

function parseColumns(value: unknown): string[] {
  if (typeof value !== "string" || value === "") return [...defaultColumns]
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) return parsed
  } catch {
    // fall through to default
  }
  return [...defaultColumns]
}

function parseRows(value: unknown): string[][] {
  if (typeof value !== "string" || value === "") return defaultRows.map((row) => [...row])
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed) && parsed.every((row) => Array.isArray(row) && row.every((cell) => typeof cell === "string"))) {
      return parsed
    }
  } catch {
    // fall through to default
  }
  return defaultRows.map((row) => [...row])
}

const attributes: SettingsField[] = [
  createIdAttribute(),
  createCustomClassesAttribute(),
  createTextAttribute({ id: "columns", label: "Columns (JSON array)", placeholder: '["Name","Status"]', defaultValue: JSON.stringify(defaultColumns) }),
  createTextAttribute({ id: "rows", label: "Rows (JSON array of arrays)", placeholder: '[["A","B"]]', defaultValue: JSON.stringify(defaultRows) }),
]

const attributesMap = createAttributeMap(attributes)
const Icon = <Table2 className="size-4" />

const Component = (props: Props) => {
  const nodeAttributes = props.component.attributes
  const columns = parseColumns(nodeAttributes.columns ?? attributesMap.columns.defaultValue)
  const rows = parseRows(nodeAttributes.rows ?? attributesMap.rows.defaultValue)
  const customClasses = readCustomClasses(props.component.attributes)

  return (
    <section className={cn("overflow-x-auto rounded-xl border bg-card", customClasses, props.childClassName)}>
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            {columns.map((column) => (
              <th key={column} scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className={rowIndex < rows.length - 1 ? "border-b" : ""}>
              {columns.map((column, columnIndex) => (
                <td key={`${column}-${rowIndex}`} className="px-5 py-4 align-top text-foreground">
                  {row[columnIndex] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export const componentMetadata = {
  tag,
  htmlTag: "section",
  label,
  keywords,
  defaultChildren: [],
  attributes,
  Icon,
  PreviewModeComponent: withDataSource(Component),
  EditModeComponent: withEditorControls(withDataSource(Component)),
} as const satisfies Metadata
