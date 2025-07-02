import React, { useEffect, useState } from "react"
import { decodeDataSourceSettings, getDataSourceInfo } from "@/features/data-sources"
import type { DataSourceId } from "@/features/data-sources/types"
import type { ComponentAttributes, ComponentProps, ComponentTag, DesignComponent } from "@/features/design-components/types"
import { insertDataSourceDataInString } from "@/lib/utils"

function replaceConnectedComponentProperties<T extends DesignComponent<ComponentTag>>(originalComponent: T, dataFromSource: unknown): T {
	const newComponent = { ...originalComponent, children: [] } as T
	const keysToSkip = ["__data_source__"]

	for (const _key in originalComponent.attributes) {
		const key = _key as keyof ComponentAttributes<ComponentTag>
		if (keysToSkip.includes(key)) {
			continue
		}
		const originalValue = (originalComponent.attributes as ComponentAttributes<ComponentTag>)[key as keyof ComponentAttributes<ComponentTag>]
		const newAttributes = newComponent.attributes as ComponentAttributes<ComponentTag>
		if (typeof originalValue === "string") {
			newAttributes[key] = insertDataSourceDataInString(originalValue, dataFromSource)
		} else {
			// @ts-expect-error TODO: Fix this type error
			newAttributes[key] = originalValue
		}
	}

	for (let i = 0; i < originalComponent.children.length; i++) {
		const child = originalComponent.children[i]
		const newChildren = newComponent.children
		if (typeof child === "string") {
			// @ts-expect-error TODO: Fix this type error
			newChildren[i] = insertDataSourceDataInString(child, dataFromSource)
		} else if (typeof child === "object" && child !== null && "attributes" in child) {
			// If the child is a component, we can recursively replace its properties
			newChildren[i] = replaceConnectedComponentProperties(child, dataFromSource)
		}
	}

	return newComponent
}

export function withConnection<Tag extends ComponentTag>(
	WrappedComponent: React.ComponentType<ComponentProps<Tag>>
) {
	return function ConnectedComponent(props: ComponentProps<Tag>) {
		const { attributes } = props.component
		const { __data_source__ } = attributes
		const [connectedData, setConnectedData] = useState<unknown>(null)
		const [loading, setLoading] = useState(false)
		const [error, setError] = useState<unknown>(null)

		useEffect(() => {
			const fetchData = async () => {
				if (__data_source__ && __data_source__.trim() !== "") {
					setLoading(true)
					setError(null)
					try {
						const decodedDataSourceSettings = decodeDataSourceSettings(__data_source__)
						const dataSourceId: DataSourceId = decodedDataSourceSettings.id
						const dataSource = getDataSourceInfo(dataSourceId)
						const result = await dataSource.tryConnection(decodedDataSourceSettings.settings)
						setConnectedData(result)
					} catch (err) {
						setError(err)
					} finally {
						setLoading(false)
					}
				}
			}
			if (__data_source__) {
				fetchData()
			}
		}, [__data_source__])

		if (__data_source__ && __data_source__.trim() !== "") {
			if (loading) return <div>Loading...</div>
			if (error) return <div>Error: {String(error)}</div>

			if (Array.isArray(connectedData)) {
				return (
					<>
						{connectedData.map((item, idx) => {
							const newComponent = replaceConnectedComponentProperties(props.component, item)
							const connectedComponent = { ...props.component, ...newComponent, attributes: { ...props.component.attributes, ...newComponent.attributes } }
							return (
								<WrappedComponent key={idx} {...props} component={connectedComponent} />
							)
						})}
					</>
				)
			} else {
				const newComponent = replaceConnectedComponentProperties(props.component, connectedData)
				const connectedComponent = { ...props.component, ...newComponent, attributes: { ...props.component.attributes, ...newComponent.attributes } }
				return <WrappedComponent {...props} component={connectedComponent} />
			}
		}

		// Not a connected component, render as usual
		return <WrappedComponent {...props} />
	}
}