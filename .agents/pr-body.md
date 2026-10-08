## Summary

Implements the Prompt Assist discoverability and onboarding improvements as specified in issue #217.

## Changes

1. **Toolbar AI Assistant button**: Added a Bot icon button to the toolbar that appears when `promptAssistEnabled` is true, allowing users to open the AI Assistant directly from the toolbar.

2. **Settings popover help text**: Added detailed step-by-step instructions in the Settings popover under the AI Assistant section, explaining how to use the feature:
   - Click the toolbar button or press ⌘K and search "Open AI Assistant"
   - Describe the page in plain language
   - The assistant picks a template, drafts copy, and tunes the design
   - Review the proposal and click "Apply"
   - Notes the deployment flag and AI provider requirements

3. **Hover tooltip on chat bubble**: Added a hover tooltip on the chat bubble (bottom-right) that appears immediately on hover (for users who haven't dismissed it), in addition to the existing timed tooltip that appears after 1 second on first visit.

4. **Example prompts in AssistPanel**: Added example prompts in the empty state of the AssistPanel to guide users on what they can ask for.

5. **Command palette integration**: The `onOpenAIAssistant` prop is now passed from the builder page to both the Toolbar and CommandPalette.

## Testing

- All existing tests pass (408 tests)
- TypeScript typecheck passes
- ESLint passes

Closes #217