import type { AppNode } from "@/features/app-state"
import type { Props, SettingsField } from "@/features/types"

type AttributeMap = Readonly<Record<ReadonlyArray<SettingsField>[number]["id"], ReadonlyArray<SettingsField>[number]>>

type BoxSide = "top" | "right" | "bottom" | "left"

const boxSides: ReadonlyArray<readonly [BoxSide, string]> = [
  ["top", "Top"],
  ["right", "Right"],
  ["bottom", "Bottom"],
  ["left", "Left"],
]

function isString(value: unknown): value is string {
  return typeof value === "string"
}

export function createAttributeMap(attributes: ReadonlyArray<SettingsField>): AttributeMap {
  return Object.fromEntries(attributes.map((attribute) => [attribute.id, attribute]))
}

export function createTextAttribute(config: Readonly<{
  id: string
  label: string
  placeholder: string
  defaultValue: string
  readOnly?: boolean
  disabled?: boolean
  getValue?: (component: Readonly<AppNode>) => string
  setValue?: (component: Readonly<Partial<AppNode>>, value: string) => AppNode
}>): SettingsField {
  return {
    id: config.id,
    type: "text",
    label: config.label,
    placeholder: config.placeholder,
    defaultValue: config.defaultValue,
    ...(config.readOnly ? { readOnly: true } : {}),
    ...(config.disabled ? { disabled: true } : {}),
    getValue: config.getValue ?? ((component) => {
      const value = component.attributes[config.id]
      return isString(value) && value !== "" ? value : config.defaultValue
    }),
    setValue: config.setValue ?? ((component, value) => ({
      ...component,
      attributes: { ...component.attributes, [config.id]: value },
    }) as AppNode),
  } satisfies SettingsField
}

export function createTextareaAttribute(config: Readonly<{
  id: string
  label: string
  placeholder: string
  defaultValue: ReadonlyArray<string>
  getValue?: (component: Readonly<AppNode>) => ReadonlyArray<string>
  setValue?: (component: Readonly<Partial<AppNode>>, value: ReadonlyArray<string>) => AppNode
}>): SettingsField {
  return {
    id: config.id,
    type: "textarea",
    label: config.label,
    placeholder: config.placeholder,
    defaultValue: [...config.defaultValue],
    getValue: config.getValue ?? ((component) => {
      const value = component.attributes[config.id]
      if (Array.isArray(value)) return value
      if (isString(value) && value !== "") return [value]
      return [...config.defaultValue]
    }),
    setValue: config.setValue ?? ((component, value) => ({
      ...component,
      attributes: { ...component.attributes, [config.id]: value },
    }) as AppNode),
  } satisfies SettingsField
}

export function createSpacingAttributes(prefix: "padding" | "margin"): SettingsField[] {
  return boxSides.map(([side, suffix]) => createTextAttribute({
    id: `${prefix}-${side}`,
    label: `${prefix[0].toUpperCase()}${prefix.slice(1)} ${suffix}`,
    placeholder: `${prefix[0].toUpperCase()}${prefix.slice(1)} ${suffix}`,
    defaultValue: "0",
  }))
}

export function readTextChildren(component: Readonly<AppNode>): string {
  const { children } = component

  if (!children) return ""
  if (Array.isArray(children)) {
    return children.filter(isString).join("")
  }

  return isString(children) ? children : ""
}

export function readTextArrayChildren(component: Readonly<AppNode>): string[] {
  const { children } = component

  if (!children) return []
  if (Array.isArray(children)) {
    return children.filter(isString)
  }

  return isString(children) ? [children] : []
}

export function readBoxSpacing(
  attributes: Readonly<Record<string, unknown>>,
  attributeMap: Readonly<Record<string, SettingsField>>,
  prefix: "padding" | "margin",
): Readonly<{ top: string; right: string; bottom: string; left: string }> {
  const read = (side: BoxSide) => {
    const key = `${prefix}-${side}`
    const value = attributes[key]
    
    if (isString(value) && value !== "") return value
    if (typeof attributeMap[key].defaultValue === "string" && attributeMap[key].defaultValue !== "") return attributeMap[key].defaultValue
    
    return ""
  }

  return {
    top: read("top"),
    right: read("right"),
    bottom: read("bottom"),
    left: read("left"),
  }
}
