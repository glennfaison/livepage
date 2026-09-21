import type { AppAction, AppNode } from "@/features/app-state"
import { appNodeTreeSchema } from "@/features/serializers/schema"
import { cvResumePersonalTemplate } from "@/features/templates/definitions/cv-resume-personal"
import { cvResumeEngineerDarkTemplate, cvResumeEngineerLightTemplate } from "@/features/templates/definitions/cv-resume-engineer"
import { parsePageTemplateDefinition, type PageTemplateDefinition } from "@/features/templates/schema"

export const pageTemplateRegistry = [
  parsePageTemplateDefinition(cvResumePersonalTemplate),
  parsePageTemplateDefinition(cvResumeEngineerDarkTemplate),
  parsePageTemplateDefinition(cvResumeEngineerLightTemplate),
] as const

export function getPageTemplateById(id: string): PageTemplateDefinition | undefined {
  return pageTemplateRegistry.find((template) => template.id === id)
}

export function cloneTemplatePages(template: PageTemplateDefinition): ReadonlyArray<AppNode> {
  return appNodeTreeSchema.parse(JSON.parse(JSON.stringify(template.content.pages)))
}

export function createApplyTemplateActions(template: PageTemplateDefinition): ReadonlyArray<AppAction> {
  const pages = cloneTemplatePages(template)
  const activePageId = pages[0]?.attributes.id ?? ""

  return [
    { type: "SET_PAGES", payload: pages },
    { type: "SET_ACTIVE_PAGE", payload: activePageId },
    { type: "SET_SELECTED_COMPONENT", payload: "" },
    { type: "SET_SELECTED_COMPONENT_ANCESTORS", payload: "" },
    {
      type: "ADD_TO_HISTORY",
      payload: {
        action: `Applied template: ${template.metadata.name}`,
        pageState: pages,
      },
    },
  ]
}
