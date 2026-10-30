# The page settings panel is wider and can be moved

**Status:** Accepted. Partly overrides a decision from PR #322 (see [What this overrides](#what-this-overrides)).

The toolbar's page Settings popover was a fixed 288px (`w-72`). Its body is `overflow-y-auto`, which
also turns on `overflow-x: auto`, and unbreakable content (the `NEXT_PUBLIC_PROMPT_ASSIST_ENABLED=1`
`<code>` in the AI Assistant help) was wider than the content box, so the body scrolled sideways.
Users also had no way to move the panel off the part of the canvas they were editing.

## Decision

- **Width.** The panel is `28rem`, capped at `100vw - 1.5rem`. The body hides horizontal overflow and
  long tokens wrap (`break-words`, `break-all` on `<code>`), so a wider panel is not the only defence.
- **Movable after it opens.** A grip (`GripVertical`) at the top-left of the header moves the panel.
  It is the only drag target: pressing the title still does nothing. Arrow keys on the focused grip move
  it by 16px, and double-click resets it.
- **Radix keeps owning placement.** The panel opens where Radix puts it, anchored to the trigger and
  flipped on collision. Dragging adds a `translate3d` offset to the inner panel (`useDraggablePanel`,
  `DraggablePanel`); it never switches the panel to `position: fixed`.
- **Always inside the viewport.** The offset is clamped against the panel's zero-offset rectangle with the
  same 12px margin as the collision padding, using the viewport size at the time of the move.
- **The offset is not persisted.** Closing the popover unmounts the panel, so it reopens at its anchor.
- **Pointer capture, not document listeners.** The grip captures the pointer, so there is no
  `document` listener and no `useEffect`, as [CONVENTIONS](../CONVENTIONS.md#react) prefers.
- **The Radix content shell is invisible and click-through.** `PopoverContent` draws a border,
  background and shadow, and it does not move with the translated panel, so it would stay behind as an
  empty box. The shell for this panel is `border-0 bg-transparent shadow-none pointer-events-none` and the
  panel opts back in with `pointer-events-auto`.

## What this overrides

None of the numbered ADRs covers the settings popover. The decision this reverses is recorded only in
the commit message and the browser test of PR #322 (`fix: keep the settings panels inside the viewport`).

- **PR #322: "the panel now always opens anchored to the Settings trigger", and its drag handlers were
  removed.** #322 removed them because they detached the panel from its anchor into fixed positioning,
  which put it off-screen. This ADR brings dragging back, so the panel no longer *stays* anchored once
  the user moves it. What #322 protected still holds: it opens anchored, Radix owns placement, the panel is
  never `position: fixed` (the `stays anchored to its trigger when the header is pressed` test is
  unchanged and passes), and a moved panel cannot leave the viewport.
- **PR #322: "one shared policy for both settings panels".** The height cap
  (`POPOVER_PANEL_MAX_HEIGHT_CLASS`) is still shared and unchanged. Width and movability now differ: the
  component settings popover (`design-components/editor-controls/settings-popover.tsx`) stays `w-72` and
  fixed.
- **The `PopoverContent` defaults** (`w-72`, bordered `bg-popover` shell) are overridden for this one
  panel, as described above. The primitive itself is unchanged.

## Not overridden

- [ADR 0003](./0003-toolbar-icon-buttons.md) and [ADR 0005](./0005-floating-toolbar-button-layout.md): the
  `L - R` balance rule and "drag handles are not counted as buttons" govern the floating *toolbar*. The new grip is in
  the settings panel's header, not in the toolbar's button row, so `assertToolbarButtonBalance` is unaffected.
- The toolbar's own drag and its persisted position (`toolbar-persistence.ts`) are untouched. The panel's offset is
  independent of them.

## Consequences

- The two settings panels are inconsistent in width and movability until the component settings popover
  adopts the same behaviour. `useDraggablePanel` lives in `client/features/page-builder`, and `design-components`
  must not import from it (see [CONVENTIONS](../CONVENTIONS.md#runtime-and-module-boundaries)), so reusing it
  there means moving the hook to a shared location first.
- Clamping happens only while dragging. If the window shrinks after the panel was moved, it is not
  re-clamped until the next drag; closing and reopening resets it.
- Touch dragging is wired (`touch-action: none` on the grip) but has not been tested on a device.
- A future popover that translates its content must also neutralize the Radix shell, or it will leave a
  ghost box behind. The browser test `moves when the grip is dragged...` guards this one.
