import React, { useCallback } from "react"
import { decodeDataSourceSettings, getDataSourceInfo } from "@/features/data-sources"
import type { DataSourceId } from "@/features/data-sources/types"
import type { Props } from "../types"
import type { AppNode } from "@/features/app-state"
import { insertDataSourceDataInString } from "@/lib/utils"
import { appSettings } from "@/app/app-settings"
import { useQuery } from "@tanstack/react-query"

const dataSourceFieldName = appSettings.dataSources.dataSourceFieldName

function replaceDataSourceComponentProperties<T extends AppNode>(originalComponent: T, dataFromSource: unknown): T {
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
			newAttributes[key] = insertDataSourceDataInString(originalValue, dataFromSource)
		} else {
			newAttributes[key] = originalValue
		}
	}

	for (let i = 0; i < originalComponent.children.length; i++) {
		const child = originalComponent.children[i]
		const newChildren = newComponent.children as Array<AppNode | string>
		if (typeof child === "string") {
			newChildren[i] = insertDataSourceDataInString(child, dataFromSource)
		} else if (typeof child === "object" && child !== null && "attributes" in child) {
			// If the child is a component, we can recursively replace its properties
			newChildren[i] = replaceDataSourceComponentProperties(child as AppNode, dataFromSource)
		}
	}

	return newComponent
}

export function withDataSource(
	WrappedComponent: React.ComponentType<Props>
) {
	return function DataSourceComponent(props: Props) {
		const dataSourceSettings = props.component.attributes[dataSourceFieldName]

		const fetchData = useCallback(async (dataSourceSettingsValue: string) => {
			try {
				const decodedDataSourceSettings = decodeDataSourceSettings(dataSourceSettingsValue)
				const dataSourceId: DataSourceId = decodedDataSourceSettings.id
				const dataSource = getDataSourceInfo(dataSourceId)
				const result = await dataSource.tryConnection(decodedDataSourceSettings.settings)
				return result
			} catch (err) {
				throw err
			}
		}, [])

		const { data: dataSourceData, isLoading: loading, error } = useQuery({
			queryKey: ["data-source-data", dataSourceSettings],
			queryFn: () => fetchData(dataSourceSettings!),
			enabled: !!dataSourceSettings,
			staleTime: 60 * 60 * 1000, // 60 minutes for now. TODO: make this configurable per data source
		})

		if (!dataSourceSettings || dataSourceSettings.trim() === "") {
			// Not a data-source-bound component, render as usual
			return <WrappedComponent {...props} />
		}

		if (loading) return <div>Loading...</div>	// TODO: show loading/skeleton component assigned to this design component
		if (error) return <div>Error: {String(error)}</div>	// TODO: show error component assigned to this design component

		const renderDataSourceComponent = (data: unknown, key?: React.Key) => {
			const newComponent = replaceDataSourceComponentProperties(props.component, data)
			const dataSourceComponent = {
				...props.component,
				...newComponent,
				attributes: { ...props.component.attributes, ...newComponent.attributes }
			}
			return <WrappedComponent {...props} component={dataSourceComponent} key={key} />
		}

		if (Array.isArray(dataSourceData)) {
			return <>{dataSourceData.map((item, idx) => renderDataSourceComponent(item, idx))}</>
		} else {
			return renderDataSourceComponent(dataSourceData)
		}
	}
}