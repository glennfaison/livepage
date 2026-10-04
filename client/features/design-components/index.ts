// Public API for the design-components module. Exposes component metadata,
// preview rendering, and setting catalog helpers.
export {
  componentMetadataByTag,
  getComponentsAllowedIn,
  getComponentInfo,
  createDesignComponentInstance,
} from "./registry"
export { PreviewRenderer } from "./preview-renderer"
export {
  applySettingValue,
  describeEditableSettings,
  readSettingValue,
} from "./settings-catalog"
export * from "./primitives"
export * from "./editor-controls"
