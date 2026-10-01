import type { AppNode, PrimitiveSettingsField, SettingsField } from "@/shared/features/types"
import { getComponentInfo } from "./registry"

// Content is stored in children and edited in place, and id is the node's identity;
// neither is a design setting.
const NON_DESIGN_IDS = new Set(["id", "content"])

function flatten(fields: ReadonlyArray<SettingsField>): PrimitiveSettingsField[] {
  return fields.flatMap((field) => {
    if (field.type === "group") return flatten(field.fields)
    return field.type === "divider" ? [] : [field]
  })
}

/**
 * Describes the design settings of a component tag that a tool (or a model)
 * may read and write: every primitive setting except id and content, minus
 * read-only or disabled ones. Derived from the registered component
 * metadata, so new components and settings show up without touching consumers.
 */
export function describeEditableSettings(tag: string): ReadonlyArray<PrimitiveSettingsField> {
  return flatten(getComponentInfo(tag).attributes).filter(
    (field) => !NON_DESIGN_IDS.has(field.id) && !field.readOnly && !field.disabled,
  )
}

/** The setting's current value on `node` as a string, through the field's own accessor when it has one. */
export function readSettingValue(node: AppNode, field: PrimitiveSettingsField): string {
  const value = field.getValue?.(node) ?? node.attributes[field.id] ?? field.defaultValue
  return Array.isArray(value) ? value.join("\n") : String(value ?? "")
}

/**
 * Returns `node` with the setting changed, through the field's own writer
 * when it has one, so settings that are not plain attributes stay correct.
 * `value` must already be valid for the field's type.
 */
export function applySettingValue(node: AppNode, field: PrimitiveSettingsField, value: string): AppNode {
  const typed = field.type === "number" ? Number(value) : field.type === "boolean" ? value === "true" : value
  const written = (field.setValue as ((node: Partial<AppNode>, value: unknown) => AppNode) | undefined)?.(node, typed)
  return written ?? { ...node, attributes: { ...node.attributes, [field.id]: value } }
}
