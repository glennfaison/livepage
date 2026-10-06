// Mock implementation of jsonpath-plus for testing
// Provides basic JSONPath query functionality

export function JSONPath({ path, json }: { path: string; json: unknown }): unknown {
	// Simple JSONPath implementation for common cases
	// Supports: $.key, $.key.subkey, $[*], $.array[*], $.array[?(@.property==value)]
	
	if (!path || path === "$") {
		return [json]
	}
	
	// Remove leading $.
	const pathParts = path.replace(/^\$\.?/, "").split(".")
	let current: unknown = json
	
	for (const part of pathParts) {
		if (current === null || current === undefined) {
			return []
		}
		
		// Handle wildcard [*]
		if (part === "*") {
			if (Array.isArray(current)) {
				return current
			}
			return []
		}
		
		// Handle filter expressions like [?(@.active==true)]
		const filterMatch = part.match(/^(.+)\[\\?\(@\.(\w+)==(.+)\)\]$/)
		if (filterMatch) {
			const arrayKey = filterMatch[1]
			const filterKey = filterMatch[2]
			const filterValue = filterMatch[3].replace(/^["']|["']$/g, "")
			
			if (Array.isArray(current)) {
				return current.filter(item => 
					item && typeof item === "object" && item[filterKey as string] == filterValue
				)
			} else if (current && typeof current === "object" && arrayKey in current) {
				const arr = current[arrayKey as keyof typeof current]
				if (Array.isArray(arr)) {
					return arr.filter(item => 
						item && typeof item === "object" && item[filterKey as string] == filterValue
					)
				}
			}
			return []
		}
		
		// Handle array access with wildcard like items[*]
		const arrayWildcardMatch = part.match(/^(\w+)\[\\*\]$/)
		if (arrayWildcardMatch) {
			const key = arrayWildcardMatch[1]
			if (current && typeof current === "object" && key in current) {
				const arr = current[key as keyof typeof current]
				if (Array.isArray(arr)) {
					return arr
				}
			}
			return []
		}
		
		// Regular property access
		if (current && typeof current === "object" && part in current) {
			current = current[part as keyof typeof current]
		} else {
			return []
		}
	}
	
	return Array.isArray(current) ? current : [current]
}