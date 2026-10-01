// Registry-independent helpers used by component definitions and editor
// controls, along with browser-safe data-source property substitution.
export { componentTagList } from "./component-tags"
export * from "./shared/component-helpers"
export {
  replaceDataSourceComponentProperties,
  decodeBrowserDataSourceSettings,
  loadBrowserDataSource,
  type DataSourceSettings as BrowserDataSourceSettings,
} from "./shared/browser-core"
