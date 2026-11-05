import { appNodeSchema } from "@/client/features/serializers/schema"
import { z } from "zod"

export const CURRENT_COMPONENT_TEMPLATE_VERSION = 1

function buildComponentTemplateDefinitionSchema() {
  return z.object({
    schema: z.literal("livepage-component-template"),
    version: z.number().int().positive().max(CURRENT_COMPONENT_TEMPLATE_VERSION),
    id: z.string().min(1),
    metadata: z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      category: z.string().min(1),
      tags: z.array(z.string().min(1)).min(1),
      thumbnail: z.string().min(1),
    }),
    content: z.object({
      root: appNodeSchema,
    }),
  }).strict()
}

let componentTemplateDefinitionSchemaCache: ReturnType<typeof buildComponentTemplateDefinitionSchema> | null = null

function getComponentTemplateDefinitionSchema(): ReturnType<typeof buildComponentTemplateDefinitionSchema> {
  if (componentTemplateDefinitionSchemaCache === null) {
    componentTemplateDefinitionSchemaCache = buildComponentTemplateDefinitionSchema()
  }
  return componentTemplateDefinitionSchemaCache
}

export type ComponentTemplateDefinition = z.infer<ReturnType<typeof buildComponentTemplateDefinitionSchema>>

export function parseComponentTemplateDefinition(input: unknown): ComponentTemplateDefinition {
  return getComponentTemplateDefinitionSchema().parse(input)
}

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
  return { ...migrated, version: CURRENT_COMPONENT_TEMPLATE_VERSION } as ComponentTemplateDefinition
}

export function validateAndMigrateComponentTemplate(input: unknown): ComponentTemplateDefinition {
  const parsed = parseComponentTemplateDefinition(input)
  if (parsed.version < CURRENT_COMPONENT_TEMPLATE_VERSION) {
    return migrateComponentTemplateToCurrent(parsed)
  }
  return parsed
}
