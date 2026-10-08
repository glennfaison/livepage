import React from "react"
import { Table2 } from "lucide-react"
import { withDataSource } from "@/client/features/data-sources"
import { withEditorControls } from "../editor-controls/decorators/with-editor-controls"
import type { Metadata, Props, SettingsField } from "@/client/features/types"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createTextAttribute, parseJsonSetting, readCustomClasses, getAccessibilityAttributes, getComponentInfo } from "@/client/features/design-components/primitives"
import { cn } from "@/client/lib/utils"

const tag = "data-table" as const
const label = "Data Table"
const keywords = ["table", "data table", "list", "rows", "diagnostic", "grid"]

const defaultColumns = ["Column 1", "Column 2", "Column 3"] as const
const defaultRows = [
  ["Row 1 value A", "Row 1 value B", "Row 1 value C"],
  ["Row 2 value A", "Row 2 value B", "Row 2 value C"],
] as const

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item): item is string => typeof item === "string")
}

function isStringMatrix(value: unknown): value is string[][] {
  return Array.isArray(value) && value.every(isStringArray)
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
  const customClasses = readCustomClasses(props.component.attributes)
  const columns = parseJsonSetting(nodeAttributes.columns || attributesMap.columns.defaultValue, isStringArray, "an array of column labels")
  const rows = parseJsonSetting(nodeAttributes.rows || attributesMap.rows.defaultValue, isStringMatrix, "an array of row arrays containing strings")
  const metadata = getComponentInfo(props.component.tag)
  const accessibilityAttrs = getAccessibilityAttributes(props.component, metadata)

  if (!columns.ok) {
    return <section className={cn("rounded-xl border p-4 text-sm text-destructive", customClasses, props.childClassName)} {...accessibilityAttrs}><p role="alert">Invalid table columns: {columns.error}</p></section>
  }
  if (!rows.ok) {
    return <section className={cn("rounded-xl border p-4 text-sm text-destructive", customClasses, props.childClassName)} {...accessibilityAttrs}><p role="alert">Invalid table rows: {rows.error}</p></section>
  }
  if (rows.value.some((row) => row.length !== columns.value.length)) {
    return <section className={cn("rounded-xl border p-4 text-sm text-destructive", customClasses, props.childClassName)} {...accessibilityAttrs}><p role="alert">Each table row must contain one cell for every column.</p></section>
  }

  return (
    <section className={cn("overflow-x-auto rounded-xl border bg-card", customClasses, props.childClassName)} {...accessibilityAttrs}>
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            {columns.value.map((column, columnIndex) => (
              <th key={`column-${columnIndex}`} scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.value.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className={rowIndex < rows.value.length - 1 ? "border-b" : ""}>
              {columns.value.map((column, columnIndex) => (
                <td key={`${column}-${rowIndex}-${columnIndex}`} className="px-5 py-4 align-top text-foreground">
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
  category: "Data",
  PreviewModeComponent: withDataSource(Component),
  EditModeComponent: withEditorControls(withDataSource(Component)),
} as const satisfies Metadata
