import { appSettings } from "@/app/app-settings"
import { AppNode } from "../types"
import { replaceCurrentDatePlaceholderInString } from "./current-date"
import { replaceDataSourcePlaceholdersInString } from "./data-source"

const dataSourceFieldName = appSettings.dataSources.dataSourceFieldName

function replacePlaceholdersInString(str: string, data: unknown, now: Date = new Date()): string {
  const withDataSourceValues = replaceDataSourcePlaceholdersInString(str, data)
  return replaceCurrentDatePlaceholderInString(withDataSourceValues, now)
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
