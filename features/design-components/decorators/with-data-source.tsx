import React, { useCallback } from "react"
import { decodeDataSourceSettings, getDataSourceInfo } from "@/features/data-sources"
import type { DataSourceId, Props } from "@/features/types"
import { appSettings } from "@/app/app-settings"
import { useQuery } from "@tanstack/react-query"
import { replaceDataSourceComponentProperties } from "@/features/placeholders/data-source"

const dataSourceFieldName = appSettings.dataSources.dataSourceFieldName

export function withDataSource(WrappedComponent: React.ComponentType<Props>) {
	return function DataSourceComponent(props: Props) {
		const dataSourceSettings = props.component.attributes[dataSourceFieldName]

		const fetchData = useCallback(async (dataSourceSettingsValue: string) => {
			try {
				const decodedDataSourceSettings = decodeDataSourceSettings(dataSourceSettingsValue)
				const dataSourceId: DataSourceId = decodedDataSourceSettings.id
				const dataSource = getDataSourceInfo(dataSourceId)
				if (!dataSource) {
					throw new Error(`Unknown data source: ${dataSourceId}`)
				}
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