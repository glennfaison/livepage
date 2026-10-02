// Dependency-free component lookup. This module holds no static imports of
// `definitions/*`, so decorators and editor controls under this feature can
// resolve component metadata by tag without creating an import cycle through
// `registry.ts` (which is the only module that imports every definition to
// populate this store).
import type { Props, Metadata, AppNode } from "@/client/features/types"

const componentMap: Record<string, Metadata> = {}

export function registerComponent(metadata: Metadata): void {
  componentMap[metadata.tag] = metadata
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
