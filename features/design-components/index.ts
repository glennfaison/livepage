"use client"

import type { Metadata, Attribute, Props } from "./types"
import { componentMetadata as Header1 } from "./header1"
import { componentMetadata as Header2 } from "./header2"
import { componentMetadata as Header3 } from "./header3"
import { componentMetadata as Paragraph } from "./paragraph"
import { componentMetadata as InlineText } from "./inline-text"
import { componentMetadata as Button } from "./button"
import { componentMetadata as Image } from "./image"
import { componentMetadata as Row } from "./row"
import { componentMetadata as Column } from "./column"
import { componentMetadata as Page } from "./page-component"
import type { AppNode } from "@/features/app-state"

/**
 * The Page component is a special case and is not included in the componentTagList,
 * as it's meant to represent the entire page and not be used as a nested component.
 */
export const componentTagList: Metadata["tag"][] = [
  Header1.tag,
  Header2.tag,
  Header3.tag,
  Paragraph.tag,
  InlineText.tag,
  Button.tag,
  Image.tag,
  Row.tag,
  Column.tag,
]

/**
 * Mapping of component tags to their metadata for easy lookup when creating new instances or rendering components.
 * This allows us to avoid using switch statements and instead directly access component metadata by tag.
 */
const componentMap: Readonly<Record<Metadata["tag"], Metadata>> = {
  [Header1.tag]: Header1,
  [Header2.tag]: Header2,
  [Header3.tag]: Header3,
  [Paragraph.tag]: Paragraph,
  [InlineText.tag]: InlineText,
  [Button.tag]: Button,
  [Image.tag]: Image,
  [Row.tag]: Row,
  [Column.tag]: Column,
  [Page.tag]: Page,
}

function getDefaultAttributes(metadata: Metadata): Readonly<Record<string, unknown>> {
  const defaultAttributes: Record<string, unknown> = {}

  for (const attribute of metadata.attributes) {
    if (attribute.type === "group" || attribute.type === "divider") continue
    if (attribute.id === "content") continue
    defaultAttributes[attribute.id] = attribute.defaultValue
  }

  return defaultAttributes
}

// Helper function to get component data by type using exhaustive switch
export function getComponentInfo(tag: string): Metadata {
  const metadata = componentMap[tag]

  return {
    ...metadata,
    keywords: [...metadata.keywords],
    defaultChildren: [...metadata.defaultChildren],
    defaultAttributes: getDefaultAttributes(metadata),
    attributes: metadata.attributes.map(attr => {
      if (attr.type === "group") {
        return {
          ...attr,
          fields: attr.fields.map(field => ({ ...field }))
        }
      }
      return { ...attr }
    }),
  }
}

// Helper function to create a new design component
export function createDesignComponentInstance(
  tag: string,
  id: string,
  overrideProps?: Props["component"]["attributes"],
): Readonly<AppNode> {
  const metadata = getComponentInfo(tag)
  const defaultChildren = [...metadata.defaultChildren]

  return {
    tag,
    attributes: { ...(metadata.defaultAttributes || {}), ...overrideProps, id: `${tag}-${id}`, },
    children: defaultChildren,
  }
}
