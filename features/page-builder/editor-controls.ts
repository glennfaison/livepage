// Editor-control surface of the page-builder public API: context, decorators,
// and popovers that design-components definitions attach to their edit-mode
// renderers. Kept separate from `./index` (which also re-exports state-aware
// hooks depending on app-state) so that design-components definitions can
// depend on editor controls without re-entering app-state's dependency chain
// (app-state -> design-components -> design-component-runtime -> these same
// definitions) while it is still loading.
export { ComponentOperationsContext, useComponentOperationsContext } from "./component-operations-context"
export { ComponentSelectorPopover, getComponentInfoSafe } from "./component-selector-popover"
export { Divider, useDividerVisibility } from "./layout-divider"
export { SettingsPopover } from "./settings-popover"
export { withEditorControls } from "./decorators/with-editor-controls"
export { withTextEditing } from "./decorators/with-text-editing"
