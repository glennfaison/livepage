import React, { useCallback, useMemo, useRef } from "react"
import { decodeDataSourceSettings, getDataSourceInfo } from "./registry"
import type { DataSourceId, Props } from "@/client/features/types"
import { DATA_SOURCE_FIELD_NAME } from "./constants"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/client/lib/utils"
import { replaceDataSourceComponentProperties } from "./browser-core"
import { DataSourceLoading, DataSourceError, readableErrorMessage } from "./data-source-states"

const dataSourceFieldName = DATA_SOURCE_FIELD_NAME

export function withDataSource(WrappedComponent: React.ComponentType<Props>) {
	function DataSourceComponent(props: Props) {
		const dataSourceSettings = props.component.attributes[dataSourceFieldName]

		if (!dataSourceSettings || dataSourceSettings.trim() === "") {
			return <WrappedComponent {...props} />
		}

		const fetchData = useCallback(async (dataSourceSettingsValue: string) => {
			const decodedDataSourceSettings = decodeDataSourceSettings(dataSourceSettingsValue)
			const dataSourceId: DataSourceId = decodedDataSourceSettings.id
			const dataSource = getDataSourceInfo(dataSourceId)
			if (!dataSource) {
				throw new Error(`Unknown data source: ${dataSourceId}`)
			}
			return dataSource.tryConnection(decodedDataSourceSettings.settings)
		}, [])

		const queryKey = ["data-source-data", dataSourceSettings]

		const queryOptions = useMemo(() => ({
			queryKey,
			queryFn: () => fetchData(dataSourceSettings!),
			enabled: !!dataSourceSettings,
			staleTime: 60 * 60 * 1000,
		}), [queryKey, fetchData, dataSourceSettings])

		const queryClient = useQuery(queryOptions)
		const { data: dataSourceData, isLoading: loading, error, refetch } = queryClient

		const retryRef = useRef(refetch)
		retryRef.current = refetch

		const handleRetry = useCallback(() => {
			retryRef.current()
		}, [])

		if (loading) return <DataSourceLoading childClassName={props.childClassName} />
		if (error) return <DataSourceError childClassName={props.childClassName} retry={handleRetry} errorMessage={readableErrorMessage(error)} />

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
			return (
				<div className={cn("block", props.childClassName)}>
					{dataSourceData.map((item, idx) => renderDataSourceComponent(item, idx))}
				</div>
			)
		} else {
			return renderDataSourceComponent(dataSourceData)
		}
	}

	DataSourceComponent.displayName = `withDataSource(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`

	return DataSourceComponent
}

withDataSource.LoadingComponent = DataSourceLoading
withDataSource.ErrorComponent = DataSourceError
withDataSource.readableErrorMessage = readableErrorMessage