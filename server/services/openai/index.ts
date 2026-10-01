// Public API for the openai module: a server-only client for OpenAI chat
// completions with schema-validated JSON replies. Import from here, never
// from ./client. It reads OPENAI_API_KEY, so never import it from a
// "use client" file.
export { completeJson, isOpenAiConfigured, OpenAiUnavailableError } from "./client"
