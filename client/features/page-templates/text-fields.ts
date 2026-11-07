import type { PageTemplateDefinition } from "./schema"

/** A template slot that plain text can be written into, derived from `dataMapping.fields`. */
export type TemplateTextField = Readonly<{ source: string; description: string }>

const isWritableTarget = (target: PageTemplateDefinition["dataMapping"]["fields"][number]["targets"][number]) =>
  target.kind === "text" && target.field === "children"

/**
 * Lists template fields that can safely be populated with single-value text.
 */
export function listTemplateTextFields(template: PageTemplateDefinition): ReadonlyArray<TemplateTextField> {
  return template.dataMapping.fields
    .filter((field) => !field.repeatable && field.targets.every(isWritableTarget))
    .map(({ source, description }) => ({ source, description }))
}
