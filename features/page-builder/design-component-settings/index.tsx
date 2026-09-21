"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ComponentLookupNotInitializedError, getRegisteredComponentInfo } from "@/features/design-component-runtime/lookup"
import type { AppNode } from "@/features/app-state"
import type { Metadata, PrimitiveSettingsField, SettingsField, SettingsFormData, SettingsValue } from "@/features/types"
import { useComponentOperationsContext } from "@/features/page-builder/component-operations-context"
import { SettingsFieldInput } from "../shared/settings-field-input"
import { formatComponentLabel } from "../shared/component-label"

type ComponentSettingsInfo = Pick<Metadata, "label" | "attributes" | "defaultChildren" | "defaultAttributes">

function getComponentSettingsInfo(tag: string): ComponentSettingsInfo {
  try {
    const metadata = getRegisteredComponentInfo(tag)
    return {
      label: metadata.label,
      attributes: metadata.attributes,
      defaultChildren: metadata.defaultChildren,
      defaultAttributes: metadata.defaultAttributes,
    }
  } catch (error) {
    if (!(error instanceof ComponentLookupNotInitializedError)) {
      throw error
    }
    return {
      label: formatComponentLabel(tag),
      attributes: [],
      defaultChildren: [],
      defaultAttributes: undefined,
    }
  }
}

function isGroupAttribute(field: SettingsField): field is Extract<SettingsField, { type: "group" }> {
  return field.type === "group"
}

function isDividerAttribute(field: SettingsField): field is Extract<SettingsField, { type: "divider" }> {
  return field.type === "divider"
}

function isPrimitiveAttribute(field: SettingsField): field is PrimitiveSettingsField {
  return field.type !== "group" && field.type !== "divider"
}

function flattenAttributes(fields: ReadonlyArray<SettingsField>): ReadonlyArray<PrimitiveSettingsField> {
  const out: PrimitiveSettingsField[] = []

  for (const field of fields) {
    if (isGroupAttribute(field)) {
      out.push(...flattenAttributes(field.fields))
      continue
    }

    if (isDividerAttribute(field)) {
      continue
    }

    if (isPrimitiveAttribute(field)) {
      out.push(field)
    }
  }

  return out
}

function readFieldValue(field: PrimitiveSettingsField, component: Readonly<AppNode>): SettingsValue {
  const value = field.getValue ? field.getValue(component) : component.attributes[field.id]

  if (field.type === "multi-select") {
    if (Array.isArray(value) && value.every((entry) => typeof entry === "string")) {
      return value
    }
    if (typeof value === "string" && value.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(value) as unknown
        if (Array.isArray(parsed) && parsed.every((entry) => typeof entry === "string")) {
          return parsed
        }
      } catch {
        // Fall through to the legacy single-string fallback below.
      }
    }
    if (Array.isArray(value)) return value.filter((entry): entry is string => typeof entry === "string")
    if (typeof value === "string" && value !== "") return [value]
    return [...field.defaultValue]
  }

  if (field.type === "boolean") {
    if (typeof value === "boolean") return value
    return value === "true"
  }

  if (field.type === "number") {
    if (typeof value === "number") return String(value)
    if (typeof value === "string") return value
    return String(field.defaultValue)
  }

  if (Array.isArray(value)) {
    return value.map((entry) => (typeof entry === "string" ? entry : "")).join("")
  }

  return String(value ?? "")
}

function resolveSaveValue(
  field: PrimitiveSettingsField,
  fieldId: string,
  value: SettingsValue,
  componentInfo: ComponentSettingsInfo,
): SettingsValue {
  if (fieldId === "content" && componentInfo.defaultChildren.length > 0 && typeof value === "string" && value.trim() === "") {
    return componentInfo.defaultChildren.filter((entry): entry is string => typeof entry === "string")
  }

  if (field.type === "multi-select") {
    if (Array.isArray(value) && value.length === 0 && field.defaultValue.length > 0) {
      return field.defaultValue
    }
    return Array.isArray(value) ? value : [String(value)]
  }

  if (field.type === "boolean") {
    return typeof value === "boolean" ? value : value === "true"
  }

  if (field.type === "number") {
    if (typeof value === "string" && value.trim() === "") {
      return field.defaultValue
    }
    if (typeof value === "string") {
      return Number(value)
    }
    return value
  }

  if (field.type === "textarea") {
    if (typeof value === "string" && value.trim() === "") {
      return field.defaultValue
    }

    return typeof value === "string" ? [value] : field.defaultValue
  }

  if (typeof value === "string" && value.trim() === "") {
    if (field.type === "select" || field.type === "text" || field.type === "color") {
      return field.defaultValue
    }

    const defaultAttributeValue = componentInfo.defaultAttributes?.[fieldId]
    if (typeof defaultAttributeValue !== "undefined") {
      return String(defaultAttributeValue)
    }
  }

  return typeof value === "string" ? value : String(value)
}

function applyFieldValue(
  update: Partial<AppNode>,
  field: PrimitiveSettingsField,
  value: SettingsValue,
): Partial<AppNode> {
  switch (field.type) {
    case "textarea": {
      const textareaValue = Array.isArray(value) ? value : [String(value)]
      return field.setValue
        ? field.setValue(update, textareaValue)
        : { ...update, children: textareaValue }
    }
    case "number": {
      const nextValue = typeof value === "number" ? value : Number(value)
      return field.setValue
        ? field.setValue(update, nextValue)
        : { ...update, attributes: { ...(update.attributes ?? {}), [field.id]: String(nextValue) } }
    }
    case "boolean": {
      const nextValue = typeof value === "boolean" ? value : value === "true"
      return field.setValue
        ? field.setValue(update, nextValue)
        : { ...update, attributes: { ...(update.attributes ?? {}), [field.id]: String(nextValue) } }
    }
    case "multi-select": {
      const nextValue = Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [String(value)]
      return field.setValue
        ? field.setValue(update, nextValue)
        : { ...update, attributes: { ...(update.attributes ?? {}), [field.id]: JSON.stringify(nextValue) } }
    }
    default: {
      const stringValue = Array.isArray(value)
        ? value.map((entry) => (typeof entry === "string" ? entry : "")).join("")
        : String(value)

      return field.setValue
        ? field.setValue(update, stringValue)
        : { ...update, attributes: { ...(update.attributes ?? {}), [field.id]: stringValue } }
    }
  }
}

function useComponentSettingsEditor({
  component,
  setIsOpen,
}: Readonly<{
  component: AppNode
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}>) {
  const componentInfo = React.useMemo(() => getComponentSettingsInfo(component.tag), [component.tag])
  const settingsFields = React.useMemo(() => componentInfo.attributes, [componentInfo.attributes])
  const [formData, setFormData] = React.useState<SettingsFormData>({})
  const { updateComponent } = useComponentOperationsContext()

  React.useEffect(() => {
    const nextFormData: Record<string, SettingsValue> = {}
    for (const field of flattenAttributes(componentInfo.attributes)) {
      nextFormData[field.id] = readFieldValue(field, component)
    }
    setFormData(nextFormData)
  }, [componentInfo.attributes, component])

  const handleSave = React.useCallback(() => {
    let update: Partial<AppNode> = {}
    for (const field of flattenAttributes(componentInfo.attributes)) {
      const resolvedValue = resolveSaveValue(field, field.id, formData[field.id] ?? "", componentInfo)
      update = applyFieldValue(update, field, resolvedValue)
    }

    updateComponent(component.attributes.id, update)
    setIsOpen(false)
  }, [component.attributes.id, componentInfo, formData, setIsOpen, updateComponent])

  const handleDiscard = React.useCallback(() => {
    const nextFormData: Record<string, SettingsValue> = {}
    for (const field of flattenAttributes(componentInfo.attributes)) {
      nextFormData[field.id] = readFieldValue(field, component)
    }
    setFormData(nextFormData)
    setIsOpen(false)
  }, [component, componentInfo.attributes, setIsOpen])

  const handleFieldChange = React.useCallback((fieldId: string, value: string | number | boolean | ReadonlyArray<string>) => {
    setFormData((previous) => ({ ...previous, [fieldId]: value }))
  }, [])

  return {
    componentInfo,
    settingsFields,
    formData,
    handleDiscard,
    handleFieldChange,
    handleSave,
  }
}

function SettingsFieldList({
  fields,
  formData,
  handleFieldChange,
}: Readonly<{
  fields: ReadonlyArray<SettingsField>
  formData: SettingsFormData
  handleFieldChange: (fieldId: string, value: SettingsValue) => void
}>): React.JSX.Element {
  return (
    <>
      {fields.map((field) => {
        if (isDividerAttribute(field)) {
          return <hr key={field.id} className="my-2 border-t" />
        }

        if (isGroupAttribute(field)) {
          return (
            <SettingsFieldGroup
              key={field.id}
              field={field}
              formData={formData}
              handleFieldChange={handleFieldChange}
            />
          )
        }

        if (!isPrimitiveAttribute(field)) {
          return null
        }

        return (
          <SettingsFieldInput
            key={field.id}
            field={field}
            value={formData[field.id] ?? field.defaultValue}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        )
      })}
    </>
  )
}

function SettingsFieldGroup({
  field,
  formData,
  handleFieldChange,
}: Readonly<{
  field: Extract<SettingsField, { type: "group" }>
  formData: SettingsFormData
  handleFieldChange: (fieldId: string, value: SettingsValue) => void
}>): React.JSX.Element {
  const [collapsed, setCollapsed] = React.useState(field.collapsed ?? false)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{field.label}</Label>
        {field.collapsible && (
          <Button size="sm" variant="ghost" onClick={() => setCollapsed((previous) => !previous)}>
            {collapsed ? "Expand" : "Collapse"}
          </Button>
        )}
      </div>

      {!collapsed && (
        <div className="pl-4 space-y-2">
          <SettingsFieldList fields={field.fields} formData={formData} handleFieldChange={handleFieldChange} />
        </div>
      )}
    </div>
  )
}

export function ComponentSettingsTabContent({
  settingsFields,
  formData,
  handleDiscard,
  handleFieldChange,
  handleSave,
}: Readonly<{
  settingsFields: ReadonlyArray<SettingsField>
  formData: SettingsFormData
  handleDiscard: () => void
  handleFieldChange: (fieldId: string, value: SettingsValue) => void
  handleSave: () => void
}>): React.JSX.Element {
  return (
    <>
      <div className="space-y-4 p-4 overflow-y-scroll flex-1">
        <SettingsFieldList fields={settingsFields} formData={formData} handleFieldChange={handleFieldChange} />
      </div>

      <div className="flex border-t">
        <Button
          variant="ghost"
          className="flex-1 rounded-none rounded-bl-lg bg-muted hover:bg-muted/80 text-foreground h-12 cursor-pointer"
          onClick={handleDiscard}
        >
          Discard
        </Button>
        <Button
          variant="ghost"
          className="flex-1 rounded-none rounded-br-lg bg-foreground hover:bg-foreground/90 text-background h-12 cursor-pointer"
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </>
  )
}

export { useComponentSettingsEditor }
