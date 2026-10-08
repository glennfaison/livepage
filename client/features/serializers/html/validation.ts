import type { AppNode } from "@/client/features/types"
import { dataSourceIdList } from "@/client/features/data-sources/registry"

export type ValidationIssue = Readonly<{
  type: "warning" | "error"
  message: string
  componentId?: string
  componentTag?: string
}>

export type ValidationResult = Readonly<{
  issues: ReadonlyArray<ValidationIssue>
  hasErrors: boolean
  hasWarnings: boolean
}>

const DATA_SOURCE_ATTRIBUTE_KEY = "data-source"

function collectAllNodes(nodes: ReadonlyArray<AppNode>): AppNode[] {
  const result: AppNode[] = []
  for (const node of nodes) {
    result.push(node)
    for (const child of node.children) {
      if (typeof child !== "string") {
        result.push(...collectAllNodes([child]))
      }
    }
  }
  return result
}

function findDataSources(nodes: ReadonlyArray<AppNode>): Array<{ node: AppNode; dataSourceId: string }> {
  const results: Array<{ node: AppNode; dataSourceId: string }> = []
  for (const node of nodes) {
    const dataSourceValue = node.attributes[DATA_SOURCE_ATTRIBUTE_KEY]
    if (dataSourceValue && typeof dataSourceValue === "string") {
      try {
        const decoded = JSON.parse(dataSourceValue)
        if (decoded && typeof decoded.id === "string") {
          results.push({ node, dataSourceId: decoded.id })
        }
      } catch {
      }
    }
    for (const child of node.children) {
      if (typeof child !== "string") {
        results.push(...findDataSources([child]))
      }
    }
  }
  return results
}

function findImagesWithRelativeUrls(nodes: ReadonlyArray<AppNode>): Array<{ node: AppNode; url: string }> {
  const results: Array<{ node: AppNode; url: string }> = []
  for (const node of nodes) {
    if (node.tag === "image") {
      const src = node.attributes.src
      if (src && typeof src === "string" && src.startsWith("/") && !src.startsWith("//")) {
        results.push({ node, url: src })
      }
      const fallbackSrc = node.attributes.fallbackSrc
      if (fallbackSrc && typeof fallbackSrc === "string" && fallbackSrc.startsWith("/") && !fallbackSrc.startsWith("//")) {
        results.push({ node, url: fallbackSrc })
      }
    }
    for (const child of node.children) {
      if (typeof child !== "string") {
        results.push(...findImagesWithRelativeUrls([child]))
      }
    }
  }
  return results
}

function findLinks(nodes: ReadonlyArray<AppNode>): Array<{ node: AppNode; href: string }> {
  const results: Array<{ node: AppNode; href: string }> = []
  for (const node of nodes) {
    if (node.tag === "link" || node.tag === "button") {
      const href = node.attributes.href
      if (href && typeof href === "string") {
        results.push({ node, href })
      }
    }
    for (const child of node.children) {
      if (typeof child !== "string") {
        results.push(...findLinks([child]))
      }
    }
  }
  return results
}

/**
 * Validates a component tree for HTML export, checking for issues that may
 * prevent the exported HTML from working correctly as a standalone document.
 * Checks include: unknown data sources, external data sources that may fail
 * due to CORS, relative image URLs without an asset base URL, relative links,
 * and missing page titles.
 *
 * @param componentTree - The component tree to validate
 * @param assetBaseUrl - Optional base URL for resolving relative asset URLs
 * @returns ValidationResult with issues, hasErrors, and hasWarnings flags
 */
export function validateHtmlExport(
  componentTree: ReadonlyArray<AppNode>,
  assetBaseUrl?: string,
): ValidationResult {
  const issues: ValidationIssue[] = []
  const allNodes = collectAllNodes(componentTree)

  const dataSources = findDataSources(allNodes)
  for (const { node, dataSourceId } of dataSources) {
    if (!dataSourceIdList.includes(dataSourceId as typeof dataSourceIdList[number])) {
      issues.push({
        type: "warning",
        message: `Unknown data source "${dataSourceId}" may not work in exported HTML`,
        componentId: node.attributes.id,
        componentTag: node.tag,
      })
      continue
    }

    const externalDataSources = ["rest-api", "graphql", "rss-feed", "json-feed", "linkedin-profile", "csv"]
    if (externalDataSources.includes(dataSourceId)) {
      issues.push({
        type: "warning",
        message: `Data source "${dataSourceId}" makes external network requests that may fail due to CORS or network restrictions in standalone HTML`,
        componentId: node.attributes.id,
        componentTag: node.tag,
      })
    }
  }

  const relativeImages = findImagesWithRelativeUrls(allNodes)
  if (relativeImages.length > 0 && !assetBaseUrl) {
    for (const { node, url } of relativeImages) {
      issues.push({
        type: "warning",
        message: `Image with relative URL "${url}" may not load correctly in exported HTML without an asset base URL`,
        componentId: node.attributes.id,
        componentTag: node.tag,
      })
    }
  }

  const links = findLinks(allNodes)
  for (const { node, href } of links) {
    if (href.startsWith("/") && !href.startsWith("//")) {
      issues.push({
        type: "warning",
        message: `Link with relative URL "${href}" may not work correctly in exported HTML`,
        componentId: node.attributes.id,
        componentTag: node.tag,
      })
    }
  }

  const pageNode = componentTree[0]
  if (pageNode) {
    const title = pageNode.attributes.title
    if (!title || title.trim() === "" || title === "Untitled Page") {
      issues.push({
        type: "warning",
        message: "Page title is empty or default - exported HTML will have generic title",
        componentId: pageNode.attributes.id,
        componentTag: pageNode.tag,
      })
    }
    const description = pageNode.attributes.description
    if (!description || description.trim() === "") {
      issues.push({
        type: "warning",
        message: "Page description is empty - exported HTML will not have meta description for SEO",
        componentId: pageNode.attributes.id,
        componentTag: pageNode.tag,
      })
    }
  }

  const hasErrors = issues.some((issue) => issue.type === "error")
  const hasWarnings = issues.some((issue) => issue.type === "warning")

  return { issues, hasErrors, hasWarnings }
}