import type { Props, Metadata } from "@/features/types"
import type { AppNode } from "@/features/app-state"
import { componentMetadata as Header1 } from "@/features/design-components/definitions/header1"
import { componentMetadata as Header2 } from "@/features/design-components/definitions/header2"
import { componentMetadata as Header3 } from "@/features/design-components/definitions/header3"
import { componentMetadata as Paragraph } from "@/features/design-components/definitions/paragraph"
import { componentMetadata as InlineText } from "@/features/design-components/definitions/inline-text"
import { componentMetadata as Link } from "@/features/design-components/definitions/link"
import { componentMetadata as Button } from "@/features/design-components/definitions/button"
import { componentMetadata as Image } from "@/features/design-components/definitions/image"
import { componentMetadata as Row } from "@/features/design-components/definitions/row"
import { componentMetadata as Column } from "@/features/design-components/definitions/column"
import { componentMetadata as Badge } from "@/features/design-components/definitions/badge"
import { componentMetadata as Divider } from "@/features/design-components/definitions/divider"
import { componentMetadata as Callout } from "@/features/design-components/definitions/callout"
import { componentMetadata as Stat } from "@/features/design-components/definitions/stat"
import { componentMetadata as Time } from "@/features/design-components/definitions/time"
import { componentMetadata as Page } from "@/features/design-components/definitions/page-component"
import { registerComponentLookup } from "./lookup"
export { componentTagList } from "./component-tags"

const componentMap: Readonly<Record<Metadata["tag"], Metadata>> = {
  [Header1.tag]: Header1,
  [Header2.tag]: Header2,
  [Header3.tag]: Header3,
  [Paragraph.tag]: Paragraph,
  [InlineText.tag]: InlineText,
  [Link.tag]: Link,
  [Button.tag]: Button,
  [Image.tag]: Image,
  [Row.tag]: Row,
  [Column.tag]: Column,
  [Badge.tag]: Badge,
  [Divider.tag]: Divider,
  [Callout.tag]: Callout,
  [Stat.tag]: Stat,
  [Time.tag]: Time,
  [Page.tag]: Page,
}

function getDefaultAttributes(metadata: Metadata): Readonly<Record<string, unknown>> {
  const defaults: Record<string, unknown> = {}
  const collectDefaults = (attributes: ReadonlyArray<Metadata["attributes"][number]>) => {
    for (const attribute of attributes) {
      if (attribute.type === "group") {
        collectDefaults(attribute.fields)
      } else if (attribute.type !== "divider" && attribute.id !== "content") {
        // AppNode attributes are always strings, but boolean/number settings fields (e.g.
        // button's "disabled") carry a typed defaultValue. Stringify it here so freshly
        // created components satisfy that contract instead of leaking a raw boolean/number
        // into `attributes`, which previously failed the LivePageAI request schema the first
        // time a "button" component's defaults were ever sent to the server.
        const value = attribute.defaultValue
        defaults[attribute.id] = typeof value === "boolean" || typeof value === "number" ? String(value) : value
      }
    }
  }
  collectDefaults(metadata.attributes)
  return defaults
}

export const getComponentInfo = function (tag: string): Metadata {
  const metadata = componentMap[tag]
  if (!metadata) throw new Error(`Unknown component tag: ${tag}`)
  return {
    ...metadata,
    keywords: [...metadata.keywords],
    defaultChildren: [...metadata.defaultChildren],
    defaultAttributes: getDefaultAttributes(metadata),
    attributes: metadata.attributes.map(attr =>
      attr.type === "group"
        ? { ...attr, fields: attr.fields.map(field => ({ ...field })) }
        : { ...attr },
    ),
  }

}

function fieldsForMetadata(metadata: Metadata): ReadonlyArray<Metadata["attributes"][number]> {
  return metadata.attributes.flatMap((field) =>
    field.type === "group" ? [field, ...fieldsForMetadata({ ...metadata, attributes: field.fields })] : [field],
  )
}

export const componentFieldIdList = Array.from(
  new Set(
    Object.values(componentMap).flatMap((metadata) =>
      fieldsForMetadata(metadata)
        .filter((field): field is Exclude<typeof field, { type: "divider" }> => field.type !== "divider")
        .map((field) => field.id),
    ),
  ),
) as [string, ...string[]]

export function getComponentField(tag: string, fieldId: string): Metadata["attributes"][number] | undefined {
  const metadata = componentMap[tag]
  if (!metadata) return undefined
  return fieldsForMetadata(metadata).find((field) => field.type !== "divider" && field.id === fieldId)
}

export function createDesignComponentInstance(
  tag: string,
  id: string,
  overrideProps?: Props["component"]["attributes"],
): Readonly<AppNode> {
  const metadata = getComponentInfo(tag)
  return {
    tag,
    attributes: { ...(metadata.defaultAttributes || {}), ...overrideProps, id: `${tag}-${id}` },
    children: [...metadata.defaultChildren],
  }
}

registerComponentLookup(getComponentInfo)
