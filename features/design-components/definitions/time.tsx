import { Clock3 } from "lucide-react"
import { withEditorControls } from "@/features/page-builder/decorators/with-editor-controls"
import { withTextEditing } from "@/features/page-builder/decorators/with-text-editing"
import type { Metadata, Props, SettingsField } from "@/features/types"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createTextAttribute, readCustomClasses } from "@/features/design-component-runtime/shared/component-helpers"
import { cn } from "@/lib/utils"

const tag = "time" as const
const label = "Time"
const keywords = ["time", "date", "timestamp", "relative", "clock"]
const attributes: SettingsField[] = [
  createIdAttribute(),
  createCustomClassesAttribute(),
  createTextAttribute({ id: "datetime", label: "Date and time", placeholder: "2026-09-20T14:30:00Z", defaultValue: "2026-09-20T14:30:00Z" }),
  createTextAttribute({ id: "display", label: "Readable text", placeholder: "Sep 20, 2026", defaultValue: "Sep 20, 2026" }),
]
const attributesMap = createAttributeMap(attributes)
const Icon = <Clock3 className="size-4" />

function TimeComponent(props: Props) {
  const datetime = String(props.component.attributes.datetime || attributesMap.datetime.defaultValue)
  const display = String(props.component.attributes.display || attributesMap.display.defaultValue)
  const customClasses = readCustomClasses(props.component.attributes)

  return (
    <time
      dateTime={datetime}
      title={datetime}
      className={cn("inline-flex w-fit cursor-help items-center gap-1.5 rounded-md text-sm text-muted-foreground underline decoration-dotted underline-offset-4", customClasses, props.childClassName)}
    >
      <Clock3 className="size-3.5" aria-hidden="true" />
      {display}
    </time>
  )
}

export const componentMetadata = {
  tag,
  label,
  keywords,
  defaultChildren: [],
  attributes,
  Icon,
  htmlTag: "time",
  PreviewModeComponent: TimeComponent,
  EditModeComponent: withEditorControls(withTextEditing(TimeComponent)),
} as const satisfies Metadata

