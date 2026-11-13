import { z } from "zod"
import { appNodeTreeSchema } from "@/client/features/serializers/schema"

export const CURRENT_COMPONENT_TEMPLATE_VERSION = 1

export const componentTemplateDefinitionSchema = z.object({
  schema: z.literal("livepage-component-template"),
  version: z.number().int().positive().max(CURRENT_COMPONENT_TEMPLATE_VERSION),
  id: z.string().min(1),
  metadata: z.object({
    name: z.string().min(1).max(120),
    description: z.string().min(1).max(600),
    category: z.string().min(1).max(80),
    tags: z.array(z.string().min(1).max(60)).min(1),
    thumbnail: z.string().min(1),
  }),
  content: z.object({
    root: appNodeTreeSchema,
  }),
}).strict()

export type ComponentTemplateDefinition = z.infer<typeof componentTemplateDefinitionSchema>

export type ComponentTemplateMigration = (
  template: ComponentTemplateDefinition
) => ComponentTemplateDefinition

export const componentTemplateMigrations: Readonly<Record<number, ComponentTemplateMigration>> = {}

export function migrateComponentTemplateToCurrent(template: ComponentTemplateDefinition): ComponentTemplateDefinition {
  let migrated = template
  for (let version = template.version; version < CURRENT_COMPONENT_TEMPLATE_VERSION; version++) {
    const migration = componentTemplateMigrations[version]
    if (!migration) {
      throw new Error(`No migration found from version ${version} to ${version + 1}`)
    }
    migrated = migration(migrated)
  }
  return { ...migrated, version: CURRENT_COMPONENT_TEMPLATE_VERSION }
}

export function validateAndMigrateComponentTemplate(input: unknown): ComponentTemplateDefinition {
  const parsed = componentTemplateDefinitionSchema.parse(input)
  if (parsed.version < CURRENT_COMPONENT_TEMPLATE_VERSION) {
    return migrateComponentTemplateToCurrent(parsed)
  }
  return parsed
}
