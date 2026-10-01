import type { Props, Metadata, AppNode } from "@/features/types"
import { componentMetadata as Header1 } from "./definitions/header1"
import { componentMetadata as Header2 } from "./definitions/header2"
import { componentMetadata as Header3 } from "./definitions/header3"
import { componentMetadata as Paragraph } from "./definitions/paragraph"
import { componentMetadata as InlineText } from "./definitions/inline-text"
import { componentMetadata as Link } from "./definitions/link"
import { componentMetadata as Button } from "./definitions/button"
import { componentMetadata as Image } from "./definitions/image"
import { componentMetadata as Row } from "./definitions/row"
import { componentMetadata as Column } from "./definitions/column"
import { componentMetadata as Badge } from "./definitions/badge"
import { componentMetadata as Divider } from "./definitions/divider"
import { componentMetadata as Callout } from "./definitions/callout"
import { componentMetadata as Stat } from "./definitions/stat"
import { componentMetadata as Time } from "./definitions/time"
import { componentMetadata as Page } from "./definitions/page-component"
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
        defaults[attribute.id] = attribute.defaultValue
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
