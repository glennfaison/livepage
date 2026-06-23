"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type React from "react"
import type { PrimitiveSettingsField, SettingsValue } from "@/features/types"

export function SettingsFieldInput({
  field,
  value,
  onChange,
}: Readonly<{
  field: PrimitiveSettingsField
  value: SettingsValue
  onChange: (value: SettingsValue) => void
}>): React.JSX.Element {
  const input = (() => {
    switch (field.type) {
      case "boolean":
        return (
          <Input
            id={field.id}
            type="checkbox"
            checked={value === true || value === "true"}
            onChange={(event) => onChange(event.target.checked)}
          />
        )
      case "number":
        return (
          <Input
            id={field.id}
            type="number"
            placeholder={field.placeholder}
            value={typeof value === "string" ? value : String(value ?? "")}
            onChange={(event) => onChange(event.target.value)}
          />
        )
      case "textarea":
        return (
          <textarea
            id={field.id}
            className={cn(
              "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3",
              "py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            )}
            placeholder={field.placeholder}
            value={typeof value === "string" ? value : Array.isArray(value) ? value.join("") : ""}
            onChange={(event) => onChange(event.target.value)}
          />
        )
      case "select":
        return (
          <Select value={typeof value === "string" ? value : ""} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "multi-select":
        return (
          <div className="space-y-2 rounded-md border border-input p-3">
            {field.options?.length ? (
              field.options.map((option) => {
                const selectedValues = Array.isArray(value) ? value : []
                const checked = selectedValues.includes(option)
                return (
                  <label key={option} className="flex items-center gap-2 text-sm">
                    <Input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        const nextValues = event.target.checked
                          ? [...selectedValues, option]
                          : selectedValues.filter((entry) => entry !== option)
                        onChange(nextValues)
                      }}
                    />
                    <span>{option}</span>
                  </label>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground">No options available</p>
            )}
          </div>
        )
      default:
        return (
          <Input
            type={field.type === "color" ? "color" : "text"}
            id={field.id}
            placeholder={field.placeholder}
            readOnly={field.readOnly}
            disabled={field.disabled}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
          />
        )
    }
  })()

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label ?? field.id}
        {field.required && <span className="text-destructive">*</span>}
      </Label>
      {input}
      {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
    </div>
  )
}
