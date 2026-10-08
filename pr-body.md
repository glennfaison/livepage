## Summary

Implements #212 - Add undo/redo buttons to the toolbar (not just keyboard shortcuts).

## Changes

- Added `Undo` and `Redo` icons from `lucide-react`
- Added undo/redo buttons in both the expanded and minimized toolbar layouts
- Buttons are disabled when there's nothing to undo/redo (using existing `canUndo`/`canRedo` state)
- Each button has a tooltip showing the action name and keyboard shortcut (⌘Z / Ctrl+Z)
- Buttons call the existing `onUndo`/`onRedo` handlers

## Acceptance Criteria

- ✅ The toolbar renders an Undo button and a Redo button
- ✅ Undo is disabled when `currentHistoryIndex <= 0`; Redo is disabled when `currentHistoryIndex >= history.length - 1`
- ✅ Each button's tooltip shows the action name and its keyboard shortcut
- ✅ Both buttons render in the horizontal and minimized toolbar layouts
- ✅ Clicking Undo calls `onUndo`; clicking Redo calls `onRedo`
- ✅ Existing keyboard shortcuts and the History popover are unchanged