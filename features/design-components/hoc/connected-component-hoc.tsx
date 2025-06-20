import React, { useEffect, useState } from "react";
import { decodeDataSourceSettings, getDataSourceInfo } from "@/features/data-sources";
import type { DataSourceId } from "@/features/data-sources/types";
import type { ComponentAttributes, ComponentProps, ComponentTag } from "@/features/design-components/types";

function replaceConnectedComponentAttributes<T extends ComponentAttributes<ComponentTag>>(originalAttributes: T, dataFromSource: unknown): T {
	const newAttributes = { ...originalAttributes } as T
	const placeholderRegExp = /\[#data.*?#\]/g
	const keysToSkip = ["__data_source__"]
	debugger

	for (const key in originalAttributes) {
		if (keysToSkip.includes(key)) {
			continue
		}
		const matches = (originalAttributes[key] as string).match(placeholderRegExp)
		if (!matches) {
			newAttributes[key] = originalAttributes[key]
			continue
		}
		matches.forEach((match) => {
			const evaluateProperty = new Function("data", `return ${match.substring(2, match.length - 2)}`)
			const output = String(evaluateProperty(dataFromSource))
			if (output !== undefined && output !== null) {
				if (typeof newAttributes[key] === "string") {
					newAttributes[key] = (newAttributes[key] as string).replaceAll(match, output) as T[Extract<keyof T, string>];
				}
			}
		})
	}

	return newAttributes
}

export function withConnection<Tag extends ComponentTag>(
	WrappedComponent: React.ComponentType<ComponentProps<Tag>>
) {
	return function ConnectedComponent(props: ComponentProps<Tag>) {
		const { attributes } = props.component;
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
						setConnectedData(result);
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
		}, [__data_source__]);

		if (__data_source__ && __data_source__.trim() !== "") {
			if (loading) return <div>Loading...</div>
			if (error) return <div>Error: {String(error)}</div>

			if (Array.isArray(connectedData)) {
				return (
					<>
						{connectedData.map((item, idx) => {
							const newAttributes = replaceConnectedComponentAttributes(attributes, item)
							const connectedComponent = { ...props.component, attributes: newAttributes }
							return (
								<WrappedComponent key={idx} {...props} component={connectedComponent} />
							);
						})}
					</>
				);
			} else {
				const newAttributes = replaceConnectedComponentAttributes(attributes, connectedData)
				const connectedComponent = { ...props.component, attributes: newAttributes }
				return <WrappedComponent {...props} component={connectedComponent} />
			}
		}

		// Not a connected component, render as usual
		return <WrappedComponent {...props} />
	};
}