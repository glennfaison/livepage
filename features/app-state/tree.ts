// State-free entry point for the app-state module: pure helpers over readonly
// AppNode trees. Unlike ./index it does not pull in the reducer (and through
// it the design-component registry), so server code and low-level modules
// such as templates can use it without loading the editor.
export { findComponentById, patchComponent } from "./commands/helpers"
