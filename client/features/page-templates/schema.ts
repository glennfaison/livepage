import { z } from "zod"
import { findComponentById } from "@/client/features/app-state"
import { appNodeTreeSchema } from "@/client/features/serializers/schema"

const templateFieldTargetSchema = z.object({
  componentId: z.string().min(1),
  kind: z.enum(["text", "multiline-text", "attribute"]),
  field: z.string().min(1),
})

const templateFieldMappingSchema = z.object({
  source: z.string().min(1),
  description: z.string().min(1),
  repeatable: z.boolean().optional(),
  targets: z.array(templateFieldTargetSchema).min(1),
})

export const CURRENT_TEMPLATE_VERSION = 1

export const pageTemplateDefinitionSchema = z.object({
  schema: z.literal("livepage-template"),
  version: z.number().int().positive().max(CURRENT_TEMPLATE_VERSION),
  id: z.string().min(1),
  metadata: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    category: z.string().min(1),
    tags: z.array(z.string().min(1)).min(1),
    thumbnail: z.string().min(1),
  }),
  content: z.object({
    pages: appNodeTreeSchema,
  }),
  dataMapping: z.object({
    source: z.literal("linkedin-profile"),
    fields: z.array(templateFieldMappingSchema).min(1),
  }),
}).strict().superRefine((template, context) => {
  // A mapping that points at a component the page does not contain would silently write nowhere.
  for (const [fieldIndex, field] of template.dataMapping.fields.entries()) {
    for (const [targetIndex, target] of field.targets.entries()) {
      if (findComponentById(template.content.pages, target.componentId)) continue
      context.addIssue({
        code: "custom",
        path: ["dataMapping", "fields", fieldIndex, "targets", targetIndex, "componentId"],
        message: `dataMapping target "${target.componentId}" does not exist in content.pages`,
      })
    }
  }
})

export type PageTemplateDefinition = z.infer<typeof pageTemplateDefinitionSchema>

export function parsePageTemplateDefinition(input: unknown): PageTemplateDefinition {
  return pageTemplateDefinitionSchema.parse(input)
}

export type TemplateMigration = (
  template: PageTemplateDefinition
) => PageTemplateDefinition

export const templateMigrations: Readonly<Record<number, TemplateMigration>> = {}

export function migrateTemplateToCurrent(template: PageTemplateDefinition): PageTemplateDefinition {
  let migrated = template
  for (let version = template.version; version < CURRENT_TEMPLATE_VERSION; version++) {
    const migration = templateMigrations[version]
    if (!migration) {
      throw new Error(`No migration found from version ${version} to ${version + 1}`)
    }
    migrated = migration(migrated)
  }
  return { ...migrated, version: CURRENT_TEMPLATE_VERSION }
}

export function validateAndMigrateTemplate(input: unknown): PageTemplateDefinition {
  const parsed = pageTemplateDefinitionSchema.parse(input)
  if (parsed.version < CURRENT_TEMPLATE_VERSION) {
    return migrateTemplateToCurrent(parsed)
  }
  return parsed
}
