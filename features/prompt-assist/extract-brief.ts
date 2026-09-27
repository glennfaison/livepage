import type { PageBrief } from "./schema"

/**
 * Keyword lexicons and light regex heuristics for turning a free-form prompt
 * into a structured PageBrief, in the spirit of ector
 * (https://github.com/Sanix-Darker/ector): fast, offline, dictionary-based
 * extraction with a graceful fallback instead of an AI call for everything.
 */

const TONE_WORDS = [
  "professional",
  "formal",
  "playful",
  "fun",
  "bold",
  "minimal",
  "minimalist",
  "clean",
  "elegant",
  "editorial",
  "moody",
  "corporate",
  "casual",
  "friendly",
  "luxury",
  "modern",
  "creative",
  "serious",
  "quirky",
] as const

const COLOR_WORDS = [
  "dark",
  "light",
  "black",
  "white",
  "blue",
  "green",
  "red",
  "purple",
  "pink",
  "orange",
  "yellow",
  "teal",
  "monochrome",
  "colorful",
  "vibrant",
  "pastel",
  "neon",
] as const

function findAllPresent(text: string, words: ReadonlyArray<string>): string[] {
  const lower = text.toLowerCase()
  return words.filter((word) => new RegExp(`\\b${word}\\b`, "i").test(lower))
}

// "called X" / "named X" / a quoted span -> a candidate name.
const NAME_PATTERNS: ReadonlyArray<RegExp> = [
  /(?:called|named)\s+["“']?([A-Za-z0-9][\w .,'-]{1,40}?)["”']?(?=[,.;!?]|$)/i,
  /["“']([^"”']{2,40})["”']/,
]

// "I'm a X" / "I am a X" / "for a/an/my X" -> a candidate headline/profession.
const HEADLINE_PATTERNS: ReadonlyArray<RegExp> = [
  /(?:i'?m|i am)\s+(?:a|an)\s+([a-z][\w .,'-]{2,60}?)(?=[,.;!?]|$)/i,
  /(?:for|about)\s+(?:a|an|my)\s+([a-z][\w .,'-]{2,60}?)(?=[,.;!?]|$)/i,
]

function firstMatch(text: string, patterns: ReadonlyArray<RegExp>): string | undefined {
  for (const pattern of patterns) {
    const match = pattern.exec(text)
    const captured = match?.[1]?.trim()
    if (captured) return captured
  }
  return undefined
}

export function extractPageBrief(rawPrompt: string): PageBrief {
  const prompt = rawPrompt.trim()

  return {
    rawPrompt: prompt,
    toneHints: findAllPresent(prompt, TONE_WORDS),
    colorHints: findAllPresent(prompt, COLOR_WORDS),
    name: firstMatch(prompt, NAME_PATTERNS),
    headline: firstMatch(prompt, HEADLINE_PATTERNS),
  }
}
