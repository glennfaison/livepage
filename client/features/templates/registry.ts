import { cvResumePersonalTemplate } from "@/client/features/templates/definitions/cv-resume-personal"
import { cvResumeEngineerDarkTemplate, cvResumeEngineerLightTemplate } from "@/client/features/templates/definitions/cv-resume-engineer"
import { portfolioPersonalSiteTemplate } from "@/client/features/templates/definitions/portfolio-personal-site"
import { linkInBioTemplate } from "@/client/features/templates/definitions/link-in-bio-page"
import { landingPageSaasTemplate } from "@/client/features/templates/definitions/landing-page-saas"
import { blogArticlePageTemplate } from "@/client/features/templates/definitions/blog-article-page"
import { agencyHomepageTemplate } from "@/client/features/templates/definitions/agency-homepage"
import { eventConferencePageTemplate } from "@/client/features/templates/definitions/event-conference-page"
import { contactAboutPageTemplate } from "@/client/features/templates/definitions/contact-about-page"
import { patientHealthDashboardTemplate } from "@/client/features/templates/definitions/patient-health-dashboard"
import { parsePageTemplateDefinition, type PageTemplateDefinition } from "@/client/features/templates/schema"

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
  parsePageTemplateDefinition(patientHealthDashboardTemplate),
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
