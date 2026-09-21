import { ComponentLookupNotInitializedError } from "@/features/design-component-runtime/lookup"

export function formatComponentLabel(tag: string): string {
  return tag
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([0-9])([a-zA-Z])/g, "$1 $2")
    .replace(/-/g, " ")
    .replace(/([a-z])([0-9])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function isRecoverableComponentInfoError(error: unknown): boolean {
  return error instanceof ComponentLookupNotInitializedError
}
