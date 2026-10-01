// Public API for the jev module: a server-only client for TypeSafe's Jev
// (System One) decision model. Import from here, never from ./client.
// It reads TYPESAFE_API_KEY, so never import it from a "use client" file.
export {
  askJev,
  isJevConfigured,
  JevUnavailableError,
  type JevChoiceAnswer,
} from "./client"
