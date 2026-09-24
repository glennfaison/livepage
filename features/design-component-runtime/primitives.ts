// Registry-independent public surface of the design-component-runtime module:
// attribute-builder helpers, the registered-component lookup indirection,
// the known component-tag list, and browser-safe data-source property
// substitution. These have no dependency on `./registry` or `./preview-renderer`
// (which assemble metadata from `design-components/definitions/*`), so
// design-components definitions and page-builder's editor controls can import
// this file without re-entering the
// design-component-runtime -> design-components -> page-builder cycle that
// assembling the registry itself requires.
//
// Consumers outside that cycle (design-components' own index, app entry
// points, tests) should prefer the full `./index` instead, which also
// includes the registry and preview renderer.
export { componentTagList } from "./component-tags"
export { getRegisteredComponentInfo, registerComponentLookup, ComponentLookupNotInitializedError } from "./lookup"
export * from "./shared/component-helpers"
export {
  replaceDataSourceComponentProperties,
  decodeBrowserDataSourceSettings,
  loadBrowserDataSource,
  type DataSourceSettings as BrowserDataSourceSettings,
} from "./shared/browser-core"
