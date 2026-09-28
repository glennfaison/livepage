/**
 * Server-only entry point for the prompt-assist feature module.
 *
 * features/prompt-assist/index.ts is the client-safe barrel used by
 * app/try/page.tsx and any other UI code; it re-exports "use client"
 * modules (the chat UI and its hook). This second, deliberately named
 * entry point (see docs/CONVENTIONS.md on multiple entry points) exists
 * because decideTemplateMatch and generateCopyDraft read server-only
 * secrets (TYPESAFE_API_KEY, OPENAI_API_KEY) and must never ship in a
 * client bundle. Route handlers under app/api/prompt-assist/** import
 * everything they need, including the shared schemas, from this file so
 * the server module graph never includes the client barrel.
 */
export * from "./schema"
export { decideTemplateMatch } from "./jev-decision"
export { generateCopyDraft } from "./copy-draft"
export { extractPageBrief } from "./extract-brief"
