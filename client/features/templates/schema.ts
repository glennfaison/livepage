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
