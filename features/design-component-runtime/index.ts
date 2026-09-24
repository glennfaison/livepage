// Public API for the design-component-runtime module. Consumers that are not
// part of the design-component-runtime <-> design-components <-> page-builder
// assembly cycle (design-components' own facade, app entry points, tests,
// build scripts) should import from here.
//
// design-components definitions and page-builder's editor controls must
// import from `./primitives` instead: `./registry` (re-exported below)
// assembles component metadata from `design-components/definitions/*`, which
// in turn depend on `./primitives` and on page-builder's editor controls, so
// importing this full index from either of those would re-enter the cycle
// while it is still loading.
export * from "./primitives"
export { getComponentInfo, createDesignComponentInstance } from "./registry"
export { PreviewRenderer } from "./preview-renderer"
