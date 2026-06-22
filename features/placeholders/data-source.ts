import type { AppNode } from "@/features/app-state"
import { appSettings } from "@/app/app-settings"
import { replacePlaceholdersInString } from "./replace-placeholders-in-string"

const dataSourceFieldName = appSettings.dataSources.dataSourceFieldName

export function replaceDataSourcePlaceholdersInString(str: string, data: unknown): string {
  const placeholderRegExp = /\[#data.*?#\]/g

  return str.replaceAll(placeholderRegExp, (match) => {
    const evaluateProperty = new Function("data", `return ${match.substring(2, match.length - 2)}`)
    const output = String(evaluateProperty(data))
    return output !== undefined && output !== null ? output : match
  })
}

export function replaceDataSourceComponentProperties<T extends AppNode>(
  originalComponent: T,
  dataFromSource: unknown,
  now: Date = new Date(),
): T {
  if (dataFromSource === null || dataFromSource === undefined) {
    return originalComponent
  }

  const newComponent = {
    ...originalComponent,
    attributes: { ...originalComponent.attributes },
    children: [...originalComponent.children],
  } as T
  const keysToSkip = [dataSourceFieldName]

  for (const _key in originalComponent.attributes) {
    const key = _key
    if (keysToSkip.includes(key)) {
      continue
    }
    const originalValue = originalComponent.attributes[key]
    const newAttributes = newComponent.attributes as Record<string, string>
    if (typeof originalValue === "string") {
      newAttributes[key] = replacePlaceholdersInString(originalValue, dataFromSource, now)
    } else {
      newAttributes[key] = originalValue
    }
  }

  for (let i = 0; i < originalComponent.children.length; i++) {
    const child = originalComponent.children[i]
    const newChildren = newComponent.children as Array<AppNode | string>
    if (typeof child === "string") {
      newChildren[i] = replacePlaceholdersInString(child, dataFromSource, now)
    } else if (typeof child === "object" && child !== null && "attributes" in child) {
      newChildren[i] = replaceDataSourceComponentProperties(child, dataFromSource, now)
    }
  }

  return newComponent
}
