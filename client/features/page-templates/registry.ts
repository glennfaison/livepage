import { cvResumePersonalTemplate } from "@/client/features/page-templates/definitions/cv-resume-personal"
import { cvResumeEngineerDarkTemplate, cvResumeEngineerLightTemplate } from "@/client/features/page-templates/definitions/cv-resume-engineer"
import { portfolioPersonalSiteTemplate } from "@/client/features/page-templates/definitions/portfolio-personal-site"
import { linkInBioTemplate } from "@/client/features/page-templates/definitions/link-in-bio-page"
import { landingPageSaasTemplate } from "@/client/features/page-templates/definitions/landing-page-saas"
import { blogArticlePageTemplate } from "@/client/features/page-templates/definitions/blog-article-page"
import { agencyHomepageTemplate } from "@/client/features/page-templates/definitions/agency-homepage"
import { eventConferencePageTemplate } from "@/client/features/page-templates/definitions/event-conference-page"
import { contactAboutPageTemplate } from "@/client/features/page-templates/definitions/contact-about-page"
import { farmLogisticsLandingPageTemplate } from "@/client/features/page-templates/definitions/farm-logistics-landing-page"
import { patientHealthDashboardTemplate } from "@/client/features/page-templates/definitions/patient-health-dashboard"
import { podcastShowPageTemplate } from "@/client/features/page-templates/definitions/podcast-show-page"
import { neighborhoodCafePageTemplate } from "@/client/features/page-templates/definitions/neighborhood-cafe-page"
import { realEstatePropertyTemplate } from "@/client/features/page-templates/definitions/real-estate-property"
import { weddingInvitationTemplate } from "@/client/features/page-templates/definitions/wedding-invitation"
import { validateAndMigrateTemplate, type PageTemplateDefinition } from "@/client/features/page-templates/schema"

export const pageTemplateRegistry = [
  validateAndMigrateTemplate(cvResumePersonalTemplate),
  validateAndMigrateTemplate(cvResumeEngineerDarkTemplate),
  validateAndMigrateTemplate(cvResumeEngineerLightTemplate),
  validateAndMigrateTemplate(portfolioPersonalSiteTemplate),
  validateAndMigrateTemplate(linkInBioTemplate),
  validateAndMigrateTemplate(landingPageSaasTemplate),
  validateAndMigrateTemplate(farmLogisticsLandingPageTemplate),
  validateAndMigrateTemplate(blogArticlePageTemplate),
  validateAndMigrateTemplate(agencyHomepageTemplate),
  validateAndMigrateTemplate(eventConferencePageTemplate),
  validateAndMigrateTemplate(contactAboutPageTemplate),
  validateAndMigrateTemplate(patientHealthDashboardTemplate),
  validateAndMigrateTemplate(podcastShowPageTemplate),
  validateAndMigrateTemplate(neighborhoodCafePageTemplate),
  validateAndMigrateTemplate(realEstatePropertyTemplate),
  validateAndMigrateTemplate(weddingInvitationTemplate),
  validateAndMigrateTemplate(restaurantMenuTemplate),
  validateAndMigrateTemplate(fitnessStudioTemplate),
] as const

/**
 * Finds a template by its ID in the registry.
 *
 * @param id - The template ID to search for
 * @returns The template definition if found, undefined otherwise
 */
export function getPageTemplateById(id: string): PageTemplateDefinition | undefined {
  return pageTemplateRegistry.find((template) => template.id === id)
}

export type PageTemplateDisplaySummary = Readonly<{
  id: string
  name: string
  description: string
  category: string
  tags: ReadonlyArray<string>
  thumbnail: string
}>

/**
 * Returns a summary of all registered templates for display in the catalog UI,
 * including thumbnail images.
 *
 * @returns Array of template display summaries
 */
export function describePageTemplateDisplayCatalog(): ReadonlyArray<PageTemplateDisplaySummary> {
  return pageTemplateRegistry.map(({ id, metadata }) => ({
    id,
    name: metadata.name,
    description: metadata.description,
    category: metadata.category,
    tags: metadata.tags,
    thumbnail: metadata.thumbnail,
  }))
}

/** The catalog-facing metadata of a template, without its page payload. */
export type PageTemplateSummary = Readonly<{
  id: string
  name: string
  category: string
  description: string
  tags: ReadonlyArray<string>
}>

/**
 * Returns a summary of all registered templates for selection logic, without
 * page content or thumbnails.
 *
 * @returns Array of template summaries
 */
export function describePageTemplateCatalog(): ReadonlyArray<PageTemplateSummary> {
  return pageTemplateRegistry.map(({ id, metadata }) => ({
    id,
    name: metadata.name,
    category: metadata.category,
    description: metadata.description,
    tags: metadata.tags,
  }))
}
import { restaurantMenuTemplate } from "@/client/features/page-templates/definitions/restaurant-menu"
import { fitnessStudioTemplate } from "@/client/features/page-templates/definitions/fitness-studio-landing"
