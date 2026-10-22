# ADR 0013: Dividers use fixed pixel thickness

**Status:** Superseded by [ADR 0014](./0014-divider-thickness-pinned-inline.md).

Dividers must render with a fixed pixel thickness (2px): height when horizontal, width when vertical. Tailwind spacing utilities (`h-2`/`w-2`) are avoided because they can be overridden or stretched by parent flex/grid layout.
