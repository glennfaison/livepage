import { cvResumePersonalTemplate } from "./definitions/cv-resume-personal"
import { cvResumeEngineerDarkTemplate, cvResumeEngineerLightTemplate } from "./definitions/cv-resume-engineer"
import { portfolioPersonalSiteTemplate } from "./definitions/portfolio-personal-site"
import { linkInBioTemplate } from "./definitions/link-in-bio-page"
import { landingPageSaasTemplate } from "./definitions/landing-page-saas"
import { blogArticlePageTemplate } from "./definitions/blog-article-page"
import { agencyHomepageTemplate } from "./definitions/agency-homepage"
import { eventConferencePageTemplate } from "./definitions/event-conference-page"
import { contactAboutPageTemplate } from "./definitions/contact-about-page"
import { farmLogisticsLandingPageTemplate } from "./definitions/farm-logistics-landing-page"
import { patientHealthDashboardTemplate } from "./definitions/patient-health-dashboard"
import { podcastShowPageTemplate } from "./definitions/podcast-show-page"
import { neighborhoodCafePageTemplate } from "./definitions/neighborhood-cafe-page"

const rawPageTemplateRegistry = [
  cvResumePersonalTemplate,
  cvResumeEngineerDarkTemplate,
  cvResumeEngineerLightTemplate,
  portfolioPersonalSiteTemplate,
  linkInBioTemplate,
  landingPageSaasTemplate,
  farmLogisticsLandingPageTemplate,
  blogArticlePageTemplate,
  agencyHomepageTemplate,
  eventConferencePageTemplate,
  contactAboutPageTemplate,
  patientHealthDashboardTemplate,
  podcastShowPageTemplate,
  neighborhoodCafePageTemplate,
] as const

export type TemplateDisplaySummary = Readonly<{
  id: string
  name: string
  description: string
  category: string
  tags: ReadonlyArray<string>
  thumbnail: string
}>

export function describeTemplateDisplayCatalog(): ReadonlyArray<TemplateDisplaySummary> {
  return rawPageTemplateRegistry.map(({ id, metadata }) => ({
    id,
    name: metadata.name,
    description: metadata.description,
    category: metadata.category,
    tags: metadata.tags,
    thumbnail: metadata.thumbnail,
  }))
}

export function getPageTemplateById(id: string): typeof rawPageTemplateRegistry[number] | undefined {
  return rawPageTemplateRegistry.find((template) => template.id === id)
}

export type PageTemplateDefinition = typeof rawPageTemplateRegistry[number]