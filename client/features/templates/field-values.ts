import type { AppNode } from "@/client/features/types"
import { patchComponent } from "@/client/features/app-state/commands/helpers"
import { listTemplateTextFields } from "@/client/features/templates/text-fields"
import type { PageTemplateDefinition } from "@/client/features/templates/schema"
export { listTemplateTextFields } from "@/client/features/templates/text-fields"

/** Writes non-empty `values` (keyed by field `source`) into the template's mapped text targets. */
export function applyTemplateFieldValues(
  pages: ReadonlyArray<AppNode>,
  template: PageTemplateDefinition,
  values: Readonly<Record<string, string>>,
): ReadonlyArray<AppNode> {
  const writable = new Set(listTemplateTextFields(template).map((field) => field.source))
  let next = pages

  for (const field of template.dataMapping.fields) {
    const value = values[field.source]?.trim()
    if (!value || !writable.has(field.source)) continue
    for (const target of field.targets) {
      next = next.flatMap((page) => patchComponent([page], target.componentId, { children: [value] }))
    }
  }
  return next
}
