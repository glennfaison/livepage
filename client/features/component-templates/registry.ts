import { calloutComponentTemplate } from "@/client/features/component-templates/definitions/callout-component"
import { validateAndMigrateComponentTemplate, type ComponentTemplateDefinition } from "@/client/features/component-templates/schema"

export const componentTemplateRegistry: ReadonlyArray<ComponentTemplateDefinition> = [
  validateAndMigrateComponentTemplate(calloutComponentTemplate),
] as const

/**
 * Finds a component template by its ID in the registry.
 */
export function getComponentTemplateById(id: string): ComponentTemplateDefinition | undefined {
  return componentTemplateRegistry.find((template) => template.id === id)
}

export type ComponentTemplateSummary = Readonly<{
  id: string
  name: string
  category: string
  description: string
  tags: ReadonlyArray<string>
}>

/**
 * Returns a summary of all registered component templates for selection logic.
 */
export function describeComponentTemplateCatalog(): ReadonlyArray<ComponentTemplateSummary> {
  return componentTemplateRegistry.map(({ id, metadata }) => ({
    id,
    name: metadata.name,
    category: metadata.category,
    description: metadata.description,
    tags: metadata.tags,
  }))
}
