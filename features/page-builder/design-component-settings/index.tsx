"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { getComponentInfo } from "@/features/design-components"
import type { Attribute, Metadata } from "@/features/design-components/types"
import type { AppNode } from "@/features/app-state"
import { useComponentOperationsContext } from "@/lib/component-operations-context"
import { SettingsFieldInput } from "../shared/settings-field-input"
import type { ComponentSettingsEditorArgs, ComponentSettingsTabContentProps } from "../types"

type ComponentFormData = Readonly<Record<string, string>>
type PrimitiveAttribute =
  | Extract<Attribute, { type: "number" }>
  | Extract<Attribute, { type: "boolean" }>
  | Extract<Attribute, { type: "text" }>
  | Extract<Attribute, { type: "textarea" }>
  | Extract<Attribute, { type: "select" }>
  | Extract<Attribute, { type: "color" }>
type FieldSaveValue = string | number | boolean | ReadonlyArray<string | AppNode>

function isGroupAttribute(field: Attribute): field is Extract<Attribute, { type: "group" }> {
  return field.type === "group"
}

function isDividerAttribute(field: Attribute): field is Extract<Attribute, { type: "divider" }> {
  return field.type === "divider"
}

function flattenAttributes(fields: ReadonlyArray<Attribute>): ReadonlyArray<PrimitiveAttribute> {
  const out: PrimitiveAttribute[] = []

  for (const field of fields) {
    if (isGroupAttribute(field)) {
      out.push(...flattenAttributes(field.fields))
      continue
    }

    if (isDividerAttribute(field)) {
      continue
    }

    out.push(field)
  }

  return out
}

function readFieldValue(field: PrimitiveAttribute, component: Readonly<AppNode>): string {
  const value = field.getValue ? field.getValue(component) : component.attributes[field.id]

  if (Array.isArray(value)) {
    return value.map((entry) => (typeof entry === "string" ? entry : "")).join("")
  }

  return String(value ?? "")
}

function resolveSaveValue(field: PrimitiveAttribute, fieldId: string, value: string, componentInfo: Metadata): FieldSaveValue {
  if (fieldId === "content" && componentInfo.defaultChildren.length > 0 && value.trim() === "") {
    return componentInfo.defaultChildren
  }

  if (value.trim() === "") {
    if (typeof field.defaultValue !== "undefined") {
      return field.defaultValue
    }

    const defaultAttributeValue = componentInfo.defaultAttributes?.[fieldId]
    if (typeof defaultAttributeValue !== "undefined") {
      return String(defaultAttributeValue)
    }
  }

  return value
}

function applyFieldValue(
  update: Partial<AppNode>,
  field: PrimitiveAttribute,
  value: FieldSaveValue,
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

function useComponentSettingsEditor({ component, setIsOpen }: ComponentSettingsEditorArgs) {
  const componentInfo = React.useMemo(() => getComponentInfo(component.tag), [component.tag])
  const settingsFields = React.useMemo(() => componentInfo.attributes, [componentInfo.attributes])
  const [formData, setFormData] = React.useState<ComponentFormData>({})
  const { updateComponent } = useComponentOperationsContext()

  React.useEffect(() => {
    const nextFormData: Record<string, string> = {}
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
    const nextFormData: Record<string, string> = {}
    for (const field of flattenAttributes(componentInfo.attributes)) {
      nextFormData[field.id] = readFieldValue(field, component)
    }
    setFormData(nextFormData)
    setIsOpen(false)
  }, [component, componentInfo.attributes, setIsOpen])

  const handleFieldChange = React.useCallback((fieldId: string, value: string) => {
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
  fields: ReadonlyArray<Attribute>
  formData: ComponentFormData
  handleFieldChange: (fieldId: string, value: string) => void
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

        return (
          <SettingsFieldInput
            key={field.id}
            field={field}
            value={formData[field.id] ?? ""}
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
  field: Extract<Attribute, { type: "group" }>
  formData: ComponentFormData
  handleFieldChange: (fieldId: string, value: string) => void
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
}: ComponentSettingsTabContentProps): React.JSX.Element {
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
