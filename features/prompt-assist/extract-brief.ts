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
// Unicode-aware so names like "José García" or "Zoë" work; a bare
// "called X and ..." stops at the first conjunction instead of swallowing
// the rest of the sentence.
const NAME_PATTERNS: ReadonlyArray<RegExp> = [
  /(?:called|named)\s+["“']?([\p{L}\p{N}][\p{L}\p{N} .'’-]{1,40}?)["”']?(?=[,;!?]|\.(?:\s|$)|\s+(?:and|who|that|which|with)\b|$)/iu,
  /["“']([^"”']{2,40})["”']/,
]

// "I'm a X" / "I am a X" / "for a/an/my X" -> a candidate headline/profession.
// The capture stops before "named X" / "called X" so that
// "for a backend engineer named Priya" yields "backend engineer".
const HEADLINE_END = String.raw`(?=[,;!?]|\.(?:\s|$)|\s+(?:named|called|who|that|which|with|and)\b|$)`
const HEADLINE_PATTERNS: ReadonlyArray<RegExp> = [
  new RegExp(String.raw`(?:i'?m|i am)\s+(?:a|an)\s+([a-z][\w .'-]{2,60}?)` + HEADLINE_END, "i"),
  new RegExp(String.raw`(?:for|about)\s+(?:a|an|my)\s+([a-z][\w .'-]{2,60}?)` + HEADLINE_END, "i"),
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
