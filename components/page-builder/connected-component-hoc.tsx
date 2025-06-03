import React, { useEffect, useState } from "react";
import { decodeDataSourceSettings, getDataSourceInfo } from "@/features/data-sources";
import type { DataSourceId } from "@/features/data-sources/types";
import type { ComponentProps, ComponentTag } from "@/features/design-components/types";

// The WrappedComponent should accept a `data` prop for the connected data
export function withConnection<T extends ComponentProps<ComponentTag>>(
	WrappedComponent: React.ComponentType<T>
) {
	return function ConnectedComponent(props: T) {
		const { attributes } = props;
		const { __data_source__ } = attributes
		const [connectedData, setConnectedData] = useState<unknown>(null);
		const [loading, setLoading] = useState(false);
		const [error, setError] = useState<unknown>(null);

		useEffect(() => {
			const fetchData = async () => {
				if (__data_source__ && __data_source__.trim() !== "") {
					setLoading(true);
					setError(null);
					try {
						const decodedDataSourceSettings = decodeDataSourceSettings(__data_source__);
						const dataSourceId: DataSourceId = decodedDataSourceSettings.id;
						const dataSource = getDataSourceInfo(dataSourceId);
						const result = await dataSource.tryConnection(decodedDataSourceSettings.settings);
						setConnectedData(result);
					} catch (err) {
						setError(err);
					} finally {
						setLoading(false);
					}
				}
			};
			fetchData();
		}, [__data_source__]);

		if (__data_source__ && __data_source__.trim() !== "") {
			if (loading) return <div>Loading...</div>;
			if (error) return <div>Error: {String(error)}</div>;
			if (Array.isArray(connectedData)) {
				return (
					<>
						{connectedData.map((item, idx) => (
							<WrappedComponent key={idx} {...props} data={item} />
						))}
					</>
				);
			}
			if (connectedData) {
				return <WrappedComponent {...props} data={connectedData} />;
			}
			return null;
		}

		// Not a connected component, render as usual
		return <WrappedComponent {...props} />;
	};
}