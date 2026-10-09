# App state reducer as source of truth

**Status:** Accepted

The app state reducer in `client/features/app-state/commands/reducer.ts` is the
single source of truth for the application. All commands, actions, and state
checks flow through it; the rest of the application reaches app state through
its interface (`useAppState`, selectors, and the exported reducer), never by
reading or mutating state directly.

## Architecture

- **Event based.** The reducer is a pure function `(state, action) => state`
  driven by discriminated-union actions (`AppAction`). Callers dispatch named
  events — `INSERT_COMPONENT`, `UPDATE_COMPONENT`, `SET_TOOLBAR_MINIMIZED`,
  `RESTORE_FROM_HISTORY`, etc. — rather than patching fields. Each action is a
  single intent; the reducer decides the next state, including history
  bookkeeping via `withHistory`.
- **Non-blocking.** The reducer itself is synchronous and pure. The only
  async side of app state — persisting to `localStorage` — lives outside the
  reducer, in the `useAppState` hook, where it is debounced. Commands never
  block on storage, and storage failures are swallowed rather than thrown into
  the dispatch path.

## Interface

The public surface is `client/features/app-state/index.ts`:

- `appReducer`, `initialState` — the reducer and its starting state.
- `selectCurrentPage` and other selectors — read-only state queries.
- `useAppState` — the React hook exposing `{ state, dispatch }`.
- `findComponentById`, `patchComponent` — tree helpers.

## Consequences

- **One place to check behavior.** A command exists or it doesn't; there is no
  second implementation to drift. New commands are added as a case in the
  reducer plus a payload type in `client/features/types.ts`.
- **State is immutable at the boundary.** The tree is `ReadonlyArray<AppNode>`.
  Mutations go through dispatch and produce a new tree.
- **History is owned by the reducer.** Undo, redo, history selection, and
  discard are all reducer actions; UI components only dispatch them.
- **Persistence is an effect, not a command.** The reducer stays pure and
  testable; storage is a debounced side effect of the hook.

## Supersedes

- [ADR 0001 — App-state API and serializers](./0001-app-state-api-and-serializers.md)
  established the command/selector boundary. This ADR sharpens it: the reducer
  is the source of truth, and it is event-based and non-blocking.