import { z } from "zod"
import { appNodeTreeSchema } from "@/features/serializers/schema"

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

export const pageTemplateDefinitionSchema = z.object({
  schema: z.literal("livepage-template"),
  version: z.literal(1),
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
}).strict()

export type PageTemplateDefinition = z.infer<typeof pageTemplateDefinitionSchema>

export function parsePageTemplateDefinition(input: unknown): PageTemplateDefinition {
  return pageTemplateDefinitionSchema.parse(input)
}
