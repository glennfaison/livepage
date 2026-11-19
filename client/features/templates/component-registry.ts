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
 * given parent tag, using the same `allowedChildTags` / `allowedParentTags`
 * rules as `getComponentsAllowedIn` and the paste check in the reducer.
 *
 * Behavior for open cases (documented for callers and tests):
 * - A component directly under the page: pass the page's tag (`"page"`) as
 *   `parentTag`. Templates whose root is allowed under page are returned.
 * - When `parentTag` is undefined (or the parent does not accept children):
 *   returns an empty list. Callers that need to hide the Templates entry for
 *   the page root itself should do so before calling this (the page root is
 *   never replaceable).
 * - Returns an empty list (never throws) when nothing is compatible.
 */
export function getComponentTemplatesAllowedIn(parentTag?: string): ReadonlyArray<ComponentTemplateDefinition> {
  const allowed = getComponentsAllowedIn(parentTag)
  const allowedTags = new Set(allowed.map((metadata) => metadata.tag))
  return getComponentTemplateRegistry().filter((template) => allowedTags.has(template.content.root.tag))
}
