// Public API for the data-sources module. Registry lookups/encoding live in
// ./registry, and the withDataSource decorator lives in ./with-data-source;
// both are re-exported here so consumers use this entry point instead of
// deep-importing either file directly. with-data-source.tsx imports registry
// functions from ./registry (not from this barrel) to avoid a self-import
// cycle within the module.
export { dataSourceIdList, getDataSourceInfo, encodeDataSourceSettings, decodeDataSourceSettings } from "./registry"
export { withDataSource } from "./with-data-source"
