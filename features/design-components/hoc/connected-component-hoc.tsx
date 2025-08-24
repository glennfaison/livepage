import React, { useCallback } from "react"
import { decodeDataSourceSettings, getDataSourceInfo } from "@/features/data-sources"
import type { DataSourceId } from "@/features/data-sources/types"
import type { DesignComponentAttributes, DesignComponentProps, DesignComponentTag, DesignComponent } from "@/features/design-components/types"
import { insertDataSourceDataInString } from "@/lib/utils"
import { appSettings } from "@/app/app-settings"
import { useQuery } from "@tanstack/react-query"

const connectionDataSourceFieldName = appSettings.connections.dataSourceFieldName as keyof DesignComponentAttributes<DesignComponentTag>

function replaceConnectedComponentProperties<T extends DesignComponent<DesignComponentTag>>(originalComponent: T, dataFromSource: unknown): T {
	if (dataFromSource === null || dataFromSource === undefined) {
		return originalComponent
	}

	const newComponent = { ...originalComponent, children: [] } as T
	const keysToSkip = [connectionDataSourceFieldName]

	for (const _key in originalComponent.attributes) {
		const key = _key as keyof DesignComponentAttributes<DesignComponentTag>
		if (keysToSkip.includes(key)) {
			continue
		}
		const originalValue = (originalComponent.attributes as DesignComponentAttributes<DesignComponentTag>)[key as keyof DesignComponentAttributes<DesignComponentTag>]
		const newAttributes = newComponent.attributes as DesignComponentAttributes<DesignComponentTag>
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

export function withConnection<Tag extends DesignComponentTag>(
	WrappedComponent: React.ComponentType<DesignComponentProps<Tag>>
) {
	return function ConnectedComponent(props: DesignComponentProps<Tag>) {
		const __datasource__ = props.component.attributes[connectionDataSourceFieldName]

		const fetchData = useCallback(async (__datasource__: string) => {
			try {
				const decodedDataSourceSettings = decodeDataSourceSettings(__datasource__)
				const dataSourceId: DataSourceId = decodedDataSourceSettings.id
				const dataSource = getDataSourceInfo(dataSourceId)
				const result = await dataSource.tryConnection(decodedDataSourceSettings.settings)
				return result
			} catch (err) {
				throw err
			}
		}, [])

		const { data: connectedData, isLoading: loading, error } = useQuery({
			queryKey: ['connected-connection-data', __datasource__],
			queryFn: () => fetchData(__datasource__!),
			enabled: !!__datasource__,
			staleTime: 60 * 60 * 1000, // 60 minutes for now. TODO: make this configurable per data source
		})

		if (!__datasource__ || __datasource__.trim() === "") {
			// Not a connected component, render as usual
			return <WrappedComponent {...props} />
		}

		if (loading) return <div>Loading...</div>	// TODO: show loading/skeleton component assigned to this design component
		if (error) return <div>Error: {String(error)}</div>	// TODO: show error component assigned to this design component

		const renderConnectedComponent = (data: unknown, key?: React.Key) => {
			const newComponent = replaceConnectedComponentProperties(props.component, data)
			const connectedComponent = {
				...props.component,
				...newComponent,
				attributes: { ...props.component.attributes, ...newComponent.attributes }
			}
			return <WrappedComponent {...props} component={connectedComponent} key={key} />
		}

		if (Array.isArray(connectedData)) {
			return <>{connectedData.map((item, idx) => renderConnectedComponent(item, idx))}</>
		} else {
			return renderConnectedComponent(connectedData)
		}
	}
}