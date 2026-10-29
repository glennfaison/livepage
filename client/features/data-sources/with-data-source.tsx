import React, { useCallback, useMemo, useRef } from "react"
import { decodeDataSourceSettings, getDataSourceInfo } from "./registry"
import type { DataSourceId, Props } from "@/client/features/types"
import { DATA_SOURCE_FIELD_NAME } from "./constants"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/client/lib/utils"
import { replaceDataSourceComponentProperties } from "./browser-core"
import { dataSourceCache, dataSourceCacheKey } from "./cache"
import { DataSourceLoading, DataSourceError, DataSourceCached, readableErrorMessage } from "./data-source-states"
import { DataSourceErrorBoundary } from "@/client/components/error-boundary"

const dataSourceFieldName = DATA_SOURCE_FIELD_NAME

export function withDataSource(WrappedComponent: React.ComponentType<Props>) {
	function DataSourceComponent(props: Props) {
		const dataSourceSettings = props.component.attributes[dataSourceFieldName]
		const isPreviewMode = props.pageBuilderMode === "preview"
		const hasDataSource = Boolean(dataSourceSettings && dataSourceSettings.trim() !== "")

		const cacheBypassRef = useRef(false)
		const cachedRef = useRef(false)

		const fetchData = useCallback(async (dataSourceSettingsValue: string) => {
			const bypassCache = cacheBypassRef.current
			cacheBypassRef.current = false

			const decodedDataSourceSettings = decodeDataSourceSettings(dataSourceSettingsValue)
			const dataSourceId: DataSourceId = decodedDataSourceSettings.id
			const key = dataSourceCacheKey(dataSourceId, decodedDataSourceSettings.settings)

			if (!bypassCache) {
				const cached = dataSourceCache.get(key)
				if (cached !== null) {
					cachedRef.current = true
					return cached
				}
			}

			cachedRef.current = false

			const dataSource = getDataSourceInfo(dataSourceId)
			if (!dataSource) {
				throw new Error(`Unknown data source: ${dataSourceId}`)
			}
			const result = await dataSource.tryConnection(decodedDataSourceSettings.settings)

			if (!bypassCache) {
				dataSourceCache.set(key, result)
			}

			return result
		}, [])

		const queryOptions = useMemo(
			() => ({
				queryKey: ["data-source-data", dataSourceSettings] as const,
				queryFn: () => fetchData(dataSourceSettings!),
				enabled: hasDataSource,
				staleTime: 60 * 60 * 1000,
				throwOnError: isPreviewMode,
			}),
			[fetchData, dataSourceSettings, hasDataSource, isPreviewMode],
		)

		const queryClient = useQuery(queryOptions)
		const { data: dataSourceData, isLoading: loading, error, refetch } = queryClient

		const retryRef = useRef(refetch)
		retryRef.current = refetch

		const handleRetry = useCallback(() => {
			cacheBypassRef.current = true
			retryRef.current()
		}, [])

		if (!hasDataSource) {
			return <WrappedComponent {...props} />
		}

		if (loading) return <DataSourceLoading childClassName={props.childClassName} />
		if (error && !isPreviewMode) {
			return (
				<DataSourceError
					childClassName={props.childClassName}
					retry={handleRetry}
					errorMessage={readableErrorMessage(error)}
				/>
			)
		}

		const renderDataSourceComponent = (data: unknown, key?: React.Key) => {
			const newComponent = replaceDataSourceComponentProperties(props.component, data)
			const dataSourceComponent = {
				...props.component,
				...newComponent,
				attributes: { ...props.component.attributes, ...newComponent.attributes },
			}
			return <WrappedComponent {...props} component={dataSourceComponent} key={key} />
		}

		const renderedContent = Array.isArray(dataSourceData) ? (
			<div className={cn("block", props.childClassName)}>
				{dataSourceData.map((item, idx) => renderDataSourceComponent(item, idx))}
			</div>
		) : (
			renderDataSourceComponent(dataSourceData)
		)

		const cached = cachedRef.current

		return (
			<DataSourceErrorBoundary isPreviewMode={isPreviewMode} onRetry={handleRetry}>
				{cached && <DataSourceCached childClassName={props.childClassName} />}
				{renderedContent}
			</DataSourceErrorBoundary>
		)
	}

	DataSourceComponent.displayName = `withDataSource(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`

	return DataSourceComponent
}

withDataSource.LoadingComponent = DataSourceLoading
withDataSource.ErrorComponent = DataSourceError
withDataSource.CachedComponent = DataSourceCached
withDataSource.readableErrorMessage = readableErrorMessage
