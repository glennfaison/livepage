# Application commands

**Status:** Accepted

This ADR catalogs the commands available in the LivePage builder and how each
one is implemented. Commands are the verbs a person (or a keyboard shortcut)
invokes to change the page. They are dispatched as `AppAction` events to the
app state reducer, which is the source of truth for application functionality
(see [ADR 0006](./0006-app-state-reducer-source-of-truth.md)).

## Command model

- Every command is a named action dispatched through `useAppState`'s
  `dispatch`. The reducer handles it; the UI only fires it.
- Commands that have a keyboard shortcut are wired in
  `client/features/page-builder/keyboard-shortcuts.ts` and in the command
  palette (`client/features/command-palette/`).
- The command palette lists commands and filters them by search term. It opens
  with `⌘K`.

## Command catalog

### Navigation and mode

| Command | Shortcut | Behavior |
| --- | --- | --- |
| Open command palette | `⌘K` | Opens the palette; commands are contextually sorted so the most relevant ones appear first based on where it is opened from (edit mode shows insert/component commands; preview mode shows export/import). |
| Switch to edit/preview mode | — | Toggles `pageBuilderMode` between `edit` and `preview`. |
| Open AI Assistant | — | Opens the prompt-assist chat when enabled. |

### History

| Command | Shortcut | Behavior |
| --- | --- | --- |
| Open history | `⌘H` | Opens the history popover listing every saved state. |
| Undo | `⌘Z` | Applies the state one history entry behind the current. |
| Redo | `⌘⇧Z` | Applies the state one history entry ahead of the current. |
| Apply history entry | — | Selecting an entry in the history popover previews it; accepting it resets the page to that saved state and commits it as the current position. |
| Discard history preview | — | Restores the page to the state before the previewed entry. |

History entries are appended by the reducer for every state-changing command. Undo
and redo walk `currentHistoryIndex`; they do not create new entries.

### Page lifecycle

| Command | Shortcut | Behavior |
| --- | --- | --- |
| Save | `⌘S` | Persists the current page to `localStorage` (debounced). It does **not** initiate an export. |
| Discard | — | Clears the page back to its initial state. |

### Components

| Command | Shortcut | Behavior |
| --- | --- | --- |
| Insert component | — | Adds a registered design component, optionally inside the selected component. Available in the command palette under "Insert component". |
| Update component | — | Changes a component's attributes or children. |
| Remove component | — | Deletes the selected component. |
| Duplicate component | — | Clones the selected component. |
| Replace component | — | Swaps the selected component for another tag. |
| Move component | — | Reparents a component (drag and drop). |
| Select component | — | Sets the active selection and its ancestor chain. |

### Import and export

| Command | Behavior |
| --- | --- |
| Save page as JSON | Downloads the page as a JSON file. |
| Save page as shortcode | Downloads the page as a shortcode file. |
| Save page as HTML | Exports the page as a standalone HTML file. |
| Preview export | Validates the export against the parity contract and previews it. |
| Copy HTML to clipboard | Copies the validated standalone HTML to the clipboard. |
| Import page from JSON | Loads a JSON export into the page. |
| Import page from shortcode | Loads a shortcode export into the page. |

### Templates

| Command | Behavior |
| --- | --- |
| Apply template | Replaces the current page with a bundled template's content, as one history entry. |

## Progressive catalog

This list is the starting point and will grow. New commands are added to the
reducer, the command palette, and the keyboard-shortcut module together, and
this ADR is updated when the catalog changes.

## Consequences

- Commands are discoverable in one place: the command palette, plus the
  shortcuts in `keyboard-shortcuts.ts`.
- Because every command dispatches an `AppAction`, the reducer remains the
  single place that decides what a command does.
- Contextual sorting in the command palette means the most relevant commands
  surface first depending on mode and selection, rather than a flat list.