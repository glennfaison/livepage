import type { AppNode } from "@/features/app-state"
import { patchComponent } from "@/features/app-state/tree"
import type { PageTemplateDefinition } from "./schema"

/** A template slot that plain text can be written into, derived from `dataMapping.fields`. */
export type TemplateTextField = Readonly<{ source: string; description: string }>

const isWritableTarget = (target: PageTemplateDefinition["dataMapping"]["fields"][number]["targets"][number]) =>
  target.kind === "text" && target.field === "children"

/**
 * Lists the template's single-value text slots (for example name, headline,
 * summary). Repeatable fields and attribute targets need structured values,
 * so they are not offered for free-text filling.
 */
export function listTemplateTextFields(template: PageTemplateDefinition): ReadonlyArray<TemplateTextField> {
  return template.dataMapping.fields
    .filter((field) => !field.repeatable && field.targets.every(isWritableTarget))
    .map(({ source, description }) => ({ source, description }))
}

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
