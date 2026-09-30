import type { AppAction, AppNode } from "@/features/app-state"
import { appNodeTreeSchema } from "@/features/serializers/schema"
import { cvResumePersonalTemplate } from "@/features/templates/definitions/cv-resume-personal"
import { cvResumeEngineerDarkTemplate, cvResumeEngineerLightTemplate } from "@/features/templates/definitions/cv-resume-engineer"
import { portfolioPersonalSiteTemplate } from "@/features/templates/definitions/portfolio-personal-site"
import { linkInBioTemplate } from "@/features/templates/definitions/link-in-bio-page"
import { landingPageSaasTemplate } from "@/features/templates/definitions/landing-page-saas"
import { blogArticlePageTemplate } from "@/features/templates/definitions/blog-article-page"
import { agencyHomepageTemplate } from "@/features/templates/definitions/agency-homepage"
import { eventConferencePageTemplate } from "@/features/templates/definitions/event-conference-page"
import { contactAboutPageTemplate } from "@/features/templates/definitions/contact-about-page"
import { parsePageTemplateDefinition, type PageTemplateDefinition } from "@/features/templates/schema"

export const pageTemplateRegistry = [
  parsePageTemplateDefinition(cvResumePersonalTemplate),
  parsePageTemplateDefinition(cvResumeEngineerDarkTemplate),
  parsePageTemplateDefinition(cvResumeEngineerLightTemplate),
  parsePageTemplateDefinition(portfolioPersonalSiteTemplate),
  parsePageTemplateDefinition(linkInBioTemplate),
  parsePageTemplateDefinition(landingPageSaasTemplate),
  parsePageTemplateDefinition(blogArticlePageTemplate),
  parsePageTemplateDefinition(agencyHomepageTemplate),
  parsePageTemplateDefinition(eventConferencePageTemplate),
  parsePageTemplateDefinition(contactAboutPageTemplate),
] as const

export function getPageTemplateById(id: string): PageTemplateDefinition | undefined {
  return pageTemplateRegistry.find((template) => template.id === id)
}

/** The catalog-facing metadata of a template, without its page payload. */
export type TemplateSummary = Readonly<{
  id: string
  name: string
  category: string
  description: string
  tags: ReadonlyArray<string>
}>

/** Describes every registered template from its own metadata, so selection logic never hard-codes the catalog. */
export function describeTemplateCatalog(): ReadonlyArray<TemplateSummary> {
  return pageTemplateRegistry.map(({ id, metadata }) => ({
    id,
    name: metadata.name,
    category: metadata.category,
    description: metadata.description,
    tags: metadata.tags,
  }))
}

export function cloneTemplatePages(template: PageTemplateDefinition): ReadonlyArray<AppNode> {
  return appNodeTreeSchema.parse(JSON.parse(JSON.stringify(template.content.pages)))
}

export function createApplyTemplateActions(
  template: PageTemplateDefinition,
  options: Readonly<{
    /** Customize the cloned pages (e.g. fill in copy) before they are applied. */
    customizePages?: (pages: ReadonlyArray<AppNode>) => ReadonlyArray<AppNode>
    historyLabel?: string
  }> = {},
): ReadonlyArray<AppAction> {
  const clonedPages = cloneTemplatePages(template)
  const pages = options.customizePages ? options.customizePages(clonedPages) : clonedPages
  const activePageId = pages[0]?.attributes.id ?? ""

  return [
    { type: "SET_PAGES", payload: pages },
    { type: "SET_ACTIVE_PAGE", payload: activePageId },
    { type: "SET_SELECTED_COMPONENT", payload: "" },
    { type: "SET_SELECTED_COMPONENT_ANCESTORS", payload: "" },
    {
      type: "ADD_TO_HISTORY",
      payload: {
        action: options.historyLabel ?? `Applied template: ${template.metadata.name}`,
        pageState: pages,
      },
    },
  ]
}
