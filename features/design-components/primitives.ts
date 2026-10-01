// Registry-independent public surface of the design-components module:
// attribute-builder helpers, the registered-component lookup indirection,
// the known component-tag list, and browser-safe data-source property
// substitution. These have no dependency on `./registry` or `./preview-renderer`
// (which assemble metadata from `design-components/definitions/*`), so
// component definitions and page-builder's editor controls can import
// this file without re-entering the dependency cycle that assembling the
// registry itself requires.
//
// Consumers outside that cycle should prefer the full `./index` instead,
// which also includes the registry and preview renderer.
export { componentTagList } from "./component-tags"
export { getRegisteredComponentInfo, registerComponentLookup, ComponentLookupNotInitializedError } from "./lookup"
export * from "./shared/component-helpers"
export {
  replaceDataSourceComponentProperties,
  decodeBrowserDataSourceSettings,
  loadBrowserDataSource,
  type DataSourceSettings as BrowserDataSourceSettings,
} from "./shared/browser-core"
