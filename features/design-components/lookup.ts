import type { Metadata } from "@/features/types"

type ComponentLookup = (tag: string) => Metadata

export class ComponentLookupNotInitializedError extends Error {
  constructor() {
    super("Design component registry has not been initialized")
    this.name = "ComponentLookupNotInitializedError"
  }
}

let componentLookup: ComponentLookup = () => {
	throw new ComponentLookupNotInitializedError()
}

export function registerComponentLookup(lookup: ComponentLookup): void {
	componentLookup = lookup
}

export function getRegisteredComponentInfo(tag: string): Metadata {
	return componentLookup(tag)
}
