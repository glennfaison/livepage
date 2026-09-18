import type { Metadata } from "@/features/types"

type ComponentLookup = (tag: string) => Metadata

let componentLookup: ComponentLookup = () => {
	throw new Error("Design component registry has not been initialized")
}

export function registerComponentLookup(lookup: ComponentLookup): void {
	componentLookup = lookup
}

export function getRegisteredComponentInfo(tag: string): Metadata {
	return componentLookup(tag)
}
