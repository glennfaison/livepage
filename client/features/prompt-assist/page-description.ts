import type { AppNode, PrimitiveSettingsField } from "@/client/features/app-state"
import { describeEditableSettings, readSettingValue } from "@/client/features/design-components"
import { MAX_DESCRIBED_NODES, type PageDescription, type SettingDescriptor } from "@/shared/features/prompt-assist/contract/schema"

const MAX_TEXT_PREVIEW = 60

export function toSettingDescriptor(field: PrimitiveSettingsField): SettingDescriptor {
  return {
    id: field.id,
    label: field.label,
    type: field.type,
    ...("options" in field && field.options ? { options: field.options } : {}),
    ...("min" in field && field.min !== undefined ? { min: field.min } : {}),
    ...("max" in field && field.max !== undefined ? { max: field.max } : {}),
  }
}

/**
 * Describes pages for the design loop, read from the component registry: each
 * component's id, tag, a short text preview and current setting values, plus the
 * settings every tag in use exposes. Browser-side by design (the registry loads
 * React components); the server receives only this description.
 */
export function describePage(pages: ReadonlyArray<AppNode | string>): PageDescription {
  const nodes: Array<PageDescription["nodes"][number]> = []
  const tags = new Set<string>()

  const visit = (children: ReadonlyArray<AppNode | string>) => {
    for (const node of children) {
      if (typeof node === "string" || nodes.length >= MAX_DESCRIBED_NODES) continue
      const text = node.children.find((child): child is string => typeof child === "string")
      tags.add(node.tag)
      nodes.push({
        id: node.attributes.id ?? "",
        tag: node.tag,
        ...(text ? { text: text.slice(0, MAX_TEXT_PREVIEW) } : {}),
        settings: Object.fromEntries(describeEditableSettings(node.tag).map((field) => [field.id, readSettingValue(node, field)])),
      })
      visit(node.children)
    }
  }
  visit(pages)

  return {
    nodes,
    settings: Object.fromEntries([...tags].map((tag) => [tag, describeEditableSettings(tag).map(toSettingDescriptor)])),
  }
}
