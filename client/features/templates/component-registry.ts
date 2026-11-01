import { callToActionTemplate } from "@/client/features/templates/definitions/component-templates/call-to-action"
import { featuresTemplate } from "@/client/features/templates/definitions/component-templates/features"
import { heroTemplate } from "@/client/features/templates/definitions/component-templates/hero"
import { statsTemplate } from "@/client/features/templates/definitions/component-templates/stats"
import { testimonialTemplate } from "@/client/features/templates/definitions/component-templates/testimonial"
import { getComponentsAllowedIn } from "@/client/features/design-components/registry-store"
import type { ComponentTemplateDefinition } from "@/client/features/templates/component-schema"

const rawComponentTemplates = [
  callToActionTemplate,
  heroTemplate,
  featuresTemplate,
  statsTemplate,
  testimonialTemplate,
] as const

const resolvedRegistry: ComponentTemplateDefinition[] = []

/**
 * The registered component templates, validated on first access. Validation is
 * deferred so importing this module from within the design-components
 * initialization chain does not hit a circular-import TDZ (the schema imports
 * `serializers/schema`, which imports the `design-components` barrel).
 */
export function getComponentTemplateRegistry(): ReadonlyArray<ComponentTemplateDefinition> {
  if (resolvedRegistry.length === 0) {
    // Lazy require breaks the circular import: component-schema -> serializers/schema
    // -> design-components barrel -> editor controls -> this module. A static import
    // of the validator evaluated the cycle before design-components/registry finished
    // initializing (TDZ on the registry export).
    const { validateAndMigrateComponentTemplate } = require("@/client/features/templates/component-schema") as typeof import("@/client/features/templates/component-schema")
    resolvedRegistry.push(
      ...rawComponentTemplates.map((template) => validateAndMigrateComponentTemplate(template)),
    )
  }
  return resolvedRegistry
}

/**
 * Finds a component template by its ID in the registry.
 */
export function getComponentTemplateById(id: string): ComponentTemplateDefinition | undefined {
  return getComponentTemplateRegistry().find((template) => template.id === id)
}

export type ComponentTemplateDisplaySummary = Readonly<{
  id: string
  name: string
  description: string
  category: string
  tags: ReadonlyArray<string>
  thumbnail: string
  rootTag: string
}>

/**
 * Returns a summary of all registered component templates for display in the catalog UI.
 */
export function describeComponentTemplateDisplayCatalog(): ReadonlyArray<ComponentTemplateDisplaySummary> {
  return getComponentTemplateRegistry().map((template) => ({
    id: template.id,
    name: template.metadata.name,
    description: template.metadata.description,
    category: template.metadata.category,
    tags: template.metadata.tags,
    thumbnail: template.metadata.thumbnail,
    rootTag: template.content.root.tag,
  }))
}

/**
 * Returns the component templates whose root tag is allowed as a child of the
 * given parent tag, using the registry's allowedChildTags / allowedParentTags
 * constraints. When `parentTag` is undefined no templates are offered (a
 * component template always replaces a component inside a parent slot).
 */
export function getComponentTemplatesAllowedIn(parentTag?: string): ReadonlyArray<ComponentTemplateDefinition> {
  const allowed = getComponentsAllowedIn(parentTag)
  const allowedTags = new Set(allowed.map((metadata) => metadata.tag))
  return getComponentTemplateRegistry().filter((template) => allowedTags.has(template.content.root.tag))
}
