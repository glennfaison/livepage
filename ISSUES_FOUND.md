# Issues Found in LivePage Deployed App

## Critical Bugs

### 1. Preview Export doesn't open popup
**Test**: `Preview Export opens new tab`
**Behavior**: Clicking "Preview Export" in the Export dropdown doesn't open a new browser tab/popup. No validation dialog appears, no console errors.
**Expected**: Should open a new tab with the exported HTML preview.
**Impact**: Users cannot preview their exported HTML before downloading.

### 2. Copy HTML to Clipboard doesn't show success feedback
**Test**: `Copy HTML to Clipboard works`
**Behavior**: Clicking "Copy HTML to Clipboard" doesn't show any toast notification. No console errors.
**Expected**: Should show a success toast like "HTML copied" or "Exported HTML has been copied to clipboard."
**Impact**: Users don't know if the copy operation succeeded.

### 3. Discard changes doesn't show confirmation dialog
**Test**: `Discard changes works`
**Behavior**: Clicking the Discard button (X icon) doesn't show a confirmation dialog. Dialog count is 0.
**Expected**: Should show a confirmation dialog asking "Are you sure you want to discard changes?" with Discard/Cancel buttons.
**Impact**: Users can accidentally lose work without confirmation.

### 4. Template card has invisible button overlay covering entire card
**Test**: `Template can be applied from catalog` (original failure)
**Behavior**: The template card has an invisible button (`ApplyTemplateButton`) that covers the entire card with `absolute inset-0`, intercepting clicks on the template name, description, and other elements.
**Expected**: The Apply button should only cover the clickable area, or the card should be clickable without an invisible overlay.
**Impact**: Poor UX - users can't select text in the template card, and screen readers may have issues.

## UX/Usability Issues

### 5. "Add Row" button persists after template application
**Observation**: After applying a template, the "Add Row" button remains visible in the canvas. This might be by design (it's a persistent canvas action), but it makes it hard to verify template application in tests.
**Note**: The template content IS applied (verified by canvas content showing "Avery Johnson" etc.)

### 6. Command palette has duplicate "Save" entries
**Test**: `Command palette has all expected commands` (strict mode violation)
**Behavior**: Searching for "Save" in command palette matches multiple elements: "Changes are saved to history", "Save page as JSON", "Save page as Shortcode".
**Expected**: Command palette items should have unique, distinguishable labels.

### 7. No keyboard shortcut for Redo in toolbar
**Observation**: The toolbar has keyboard shortcuts for Save (Cmd+S), History (Cmd+Shift+H), Undo (Cmd+Z), but Redo (Cmd+Shift+Z) is only available via keyboard shortcut, not in the toolbar UI.

## Accessibility Issues

### 8. Template card invisible button may cause screen reader issues
The `ApplyTemplateButton` with `absolute inset-0` covers the entire card content, which may interfere with screen reader navigation and text selection.

## Potential Improvements

### 9. Add loading states for export operations
Export operations (JSON, Shortcode, HTML, Preview) don't show loading indicators during processing.

### 10. Add toast notifications for all user actions
- Template applied successfully
- Page saved
- Changes discarded
- Import completed

### 11. Improve empty state in canvas
The "Add Row" button in the empty canvas could be more prominent or have better empty state messaging.

### 12. Add template preview on hover
Show a larger preview of the template when hovering over a template card in the catalog.

### 13. Add search/filter in command palette
The command palette could benefit from a search input to filter commands.

### 14. Add undo/redo buttons to toolbar (optional)
Currently only available via keyboard shortcuts (Cmd+Z / Cmd+Shift+Z).

### 15. Add keyboard shortcut hints in tooltips
Toolbar buttons should show keyboard shortcuts in their tooltips (e.g., "Save (⌘S)").