# LivePage

This is the project glossary for LivePage: a dedicated reference for entities, relationships, and domain language in the app.

## Language

**App state**:
The shared in-memory representation of the current page builder document.
_Avoid_: State, store, data model

**App node**:
The readonly tree node used to represent a page or nested design component, including its tag, string attributes, and child nodes.
_Avoid_: Component instance, element

**Design component**:
A registered page-builder component with metadata, default content, settings fields, and separate edit-mode and preview-mode renderers.
_Avoid_: Widget, block

**App-state API**:
The boundary for reading from and mutating app state through explicit commands and selectors.
_Avoid_: Facade, helper layer

**App state reducer**:
The pure `(state, action) => state` function in `client/features/app-state/commands/reducer.ts` that is the single source of truth for the application. All commands, actions, and state checks flow through it; it is event based (driven by `AppAction` events) and non-blocking (persistence is a debounced side effect in the `useAppState` hook, not a command).
_Avoid_: Store, state machine

**Command**:
A named, dispatchable intent — such as `Undo`, `Save`, or `Insert component` — that changes app state through the reducer. Commands are exposed through the command palette and keyboard shortcuts.
_Avoid_: Action, button

**Command palette**:
The `⌘K` dialog that lists every command, filtered by search term, with commands contextually sorted so the most relevant ones appear first based on where it is opened from.
_Avoid_: Command menu, action picker

**Floating toolbar**:
The draggable, minimizable control strip that floats over the canvas in edit mode. It is icon-only and balanced around the minimize/maximize pivot.
_Avoid_: Floating bar, tool palette

**Minimize/maximize pivot**:
The center control of the floating toolbar: the minimize button when expanded, the maximize button when minimized. Buttons are distributed evenly to its left and right so that `L - R` is always `-1`, `0`, or `1`.
_Avoid_: Center button

**History entry**:
A saved snapshot of the page state, appended by the reducer for every state-changing command.
_Avoid_: Undo point, checkpoint

**Serializers**:
Modules that transform app state to and from external formats such as JSON, shortcode, and HTML.
_Avoid_: Exporters, importers

**Data source**:
An external provider that supplies data to a design component.
_Avoid_: Connection

**Placeholder**:
A runtime token embedded in a component string and replaced before rendering.
_Avoid_: Template marker

**Data-source placeholder**:
A placeholder whose value comes from a data source.
_Avoid_: Connection placeholder

**Computable placeholder**:
A placeholder whose value is derived at runtime, such as the current date.
_Avoid_: Dynamic token

**Standalone HTML export**:
An exported page artifact that can be opened directly in a modern browser without running LivePage.
_Avoid_: Static HTML snapshot

**Prompt assist chat**:
The minimizable chatbox on the builder where a person describes a page in their own words and reviews a Template match, Copy draft, and Design edits before applying them.
_Avoid_: Chatbot, AI assistant

**Template match**:
The template chosen for a request from the template catalog, judged by Jev (or OpenAI as fallback) and reported with its probability.
_Avoid_: Recommendation, suggestion

**Clarifying question**:
The single question the chat asks when a request is too ambiguous for a Template match; its answer is added to the request.
_Avoid_: Follow-up, prompt

**Copy draft**:
Text for the free-text slots a template declares in its `dataMapping`, proposed from the request and editable before it is applied.
_Avoid_: Generated content, AI copy

**Page description**:
The compact list of a page's components, their current design settings, and the settings each tag exposes, derived from the component registry and sent to the server for the Design loop.
_Avoid_: Snapshot, page dump

**Design edit**:
One proposed change to a single design setting of one component, validated against that setting before it is applied.
_Avoid_: Patch, tweak

**Design loop**:
The bounded cycle of judging whether the page satisfies the request and applying the next batch of Design edits until it does or stops changing.
_Avoid_: Auto-design, agent loop

## Relationships

- The **App-state API** operates on **App state**
- **App state** is represented as a tree of **App nodes**
- **Design components** are created from registered component metadata and stored as **App nodes**
- **Serializers** read from or write to **App state**
- **Placeholders** are resolved inside component strings before rendering
- A **Standalone HTML export** contains serialized **App nodes** and resolves **Data sources** when opened
- A **Prompt assist chat** request resolves to a **Template match**, possibly after one or more **Clarifying questions**
- A **Template match** gets a **Copy draft**, then the **Design loop** refines its cloned **App nodes** through **Design edits** computed from a **Page description**
- Applying the result goes through the **App-state API** like any other template application, as one history entry

## Example dialogue

> **Dev:** "Should this JSON loader live in the **App-state API**?"
> **Domain expert:** "No — the API owns commands and selectors. The JSON loader is a **Serializer** that feeds it."

> **Dev:** "Why does the Design loop send a **Page description** instead of the page?"
> **Domain expert:** "The server can't load the component registry, so the browser describes the page and validates every **Design edit** again against the real components before applying it."
