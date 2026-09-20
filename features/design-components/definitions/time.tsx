import { Clock3 } from "lucide-react"
import { withEditorControls } from "@/features/page-builder/decorators/with-editor-controls"
import { withTextEditing } from "@/features/page-builder/decorators/with-text-editing"
import type { Metadata, Props, SettingsField } from "@/features/types"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createTextAttribute, readCustomClasses, readTextChildren } from "@/features/design-component-runtime/shared/component-helpers"
import { cn } from "@/lib/utils"

const tag = "time" as const
const label = "Time"
const keywords = ["time", "date", "localized", "relative", "timestamp"]
const attributes: SettingsField[] = [
  createIdAttribute(),
  createCustomClassesAttribute(),
  createTextAttribute({
    id: "dateTime",
    label: "Date and time",
    placeholder: "2026-09-20T12:00:00Z",
    defaultValue: "2026-09-20T12:00:00Z",
  }),
  createTextAttribute({
    id: "label",
    label: "Label",
    placeholder: "Updated",
    defaultValue: "Updated",
    getValue: readTextChildren,
    setValue: (component, value) => ({ ...component, children: [value] } as Props["component"]),
  }),
]
const attributesMap = createAttributeMap(attributes)

function formatRelativeTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const absoluteSeconds = Math.abs(seconds)
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ]
  for (const [unit, unitSeconds] of units) {
    if (absoluteSeconds >= unitSeconds) {
      return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(Math.round(seconds / unitSeconds), unit)
    }
  }
  return "just now"
}

const Component = (props: Props) => {
  const dateTime = String(props.component.attributes.dateTime || attributesMap.dateTime.defaultValue)
  const labelText = readTextChildren(props.component) || attributesMap.label.defaultValue
  const date = new Date(dateTime)
  const fullDate = Number.isNaN(date.getTime()) ? dateTime : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date)
  return (
    <time
      dateTime={dateTime}
      title={fullDate}
      className={cn("inline-flex items-center gap-1.5 text-sm text-muted-foreground underline decoration-dotted underline-offset-4", readCustomClasses(props.component.attributes), props.childClassName)}
    >
      <Clock3 className="size-3.5" aria-hidden="true" />
      <span>{labelText}</span>
      <span className="text-xs">({formatRelativeTime(dateTime)})</span>
    </time>
  )
}

export const componentMetadata = {
  tag,
  label,
  keywords,
  defaultChildren: ["Updated"],
  attributes,
  Icon: <Clock3 className="size-4" />,
  htmlTag: "time",
  PreviewModeComponent: Component,
  EditModeComponent: withEditorControls(withTextEditing(Component)),
} as const satisfies Metadata

export default componentMetadata
