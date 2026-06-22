"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type React from "react"

export type SettingsFieldInputModel = Readonly<{
  id: string
  label?: string
  type: "text" | "number" | "boolean" | "textarea" | "select" | "color"
  placeholder?: string
  options?: ReadonlyArray<string>
  description?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
}>

export type SettingsFieldInputProps = Readonly<{
  field: SettingsFieldInputModel
  value: string
  onChange: (value: string) => void
}>

export function SettingsFieldInput({ field, value, onChange }: SettingsFieldInputProps): React.JSX.Element {
  const input = (() => {
    switch (field.type) {
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
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        )
      case "select":
        return (
          <Select value={value} onValueChange={onChange}>
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
      default:
        return (
          <Input
            type={field.type}
            id={field.id}
            placeholder={field.placeholder}
            readOnly={field.readOnly}
            disabled={field.disabled}
            value={value}
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
