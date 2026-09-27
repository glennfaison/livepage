import type { PageTemplateDefinition } from "@/features/templates"
import type { PageBrief, TemplateCandidate } from "./schema"

/**
 * How many of the top-ranked candidates get offered to the user (and, when
 * ambiguous, to a Jev Choice question). TypeSafe accepts 2-128 choice
 * options, so this is only about keeping the chat UI and the Jev prompt
 * readable.
 */
export const TOP_CANDIDATE_LIMIT = 4

/**
 * A minimum score lead the top candidate needs over the runner-up before we
 * trust the deterministic ranking on its own. Below this margin the request
 * is treated as ambiguous.
 */
const CONFIDENCE_MARGIN = 2

/**
 * Casual phrasing -> template-metadata vocabulary. Ector-inspired: a small,
 * hand-maintained bridge dictionary rather than a model call for the common
 * cases ("job hunt" should still find the résumé templates).
 */
const SYNONYMS: Readonly<Record<string, ReadonlyArray<string>>> = {
  resume: ["cv", "curriculum"],
  cv: ["resume", "curriculum"],
  job: ["career", "resume", "hire", "hiring"],
  hire: ["job", "resume", "recruit", "hiring"],
  hiring: ["job", "resume", "recruit"],
  startup: ["saas", "product", "launch"],
  saas: ["startup", "software", "product"],
  app: ["saas", "product", "software"],
  agency: ["studio", "business", "services", "clients"],
  studio: ["agency"],
  blog: ["article", "newsletter", "writing", "posts"],
  article: ["blog"],
  conference: ["event", "summit", "meetup", "tickets"],
  event: ["conference"],
  wedding: ["event"],
  portfolio: ["showcase", "work", "case"],
  bio: ["biolink", "link"],
  linktree: ["biolink", "link"],
  contact: ["about", "faq"],
  about: ["contact"],
}

function tokenize(text: string): ReadonlyArray<string> {
  return text.toLowerCase().match(/[a-z0-9]+/g) ?? []
}

function expandSynonyms(tokens: ReadonlyArray<string>): ReadonlySet<string> {
  const expanded = new Set(tokens)
  for (const token of tokens) {
    for (const synonym of SYNONYMS[token] ?? []) expanded.add(synonym)
  }
  return expanded
}

/**
 * Ranks every bundled template against a PageBrief using bag-of-words
 * overlap between the prompt (plus its tone/color hints) and each
 * template's category, name, description, and tags. Deliberately reads
 * from template metadata rather than a hard-coded category list, so adding
 * or renaming a template doesn't require touching this file.
 */
export function rankTemplateCandidates(
  brief: PageBrief,
  templates: ReadonlyArray<PageTemplateDefinition>,
): ReadonlyArray<TemplateCandidate> {
  const promptTokens = expandSynonyms(tokenize(brief.rawPrompt))
  const toneTokens = new Set(brief.toneHints.flatMap((hint) => tokenize(hint)))
  const colorTokens = new Set(brief.colorHints.flatMap((hint) => tokenize(hint)))

  const scored = templates.map((template): TemplateCandidate => {
    const haystack = tokenize(
      [template.metadata.category, template.metadata.name, template.metadata.description, ...template.metadata.tags].join(
        " ",
      ),
    )

    let score = 0
    for (const token of haystack) {
      if (promptTokens.has(token)) score += 2
      if (toneTokens.has(token)) score += 1
      if (colorTokens.has(token)) score += 1
    }

    return {
      templateId: template.id,
      name: template.metadata.name,
      category: template.metadata.category,
      score,
    }
  })

  return [...scored].sort((a, b) => b.score - a.score)
}

/**
 * Returns the top candidate when it clearly beats the runner-up, or null
 * when the request is ambiguous and should be resolved with a Jev Choice
 * call instead (see jev-decision.ts).
 */
export function pickConfidentMatch(
  candidates: ReadonlyArray<TemplateCandidate>,
): TemplateCandidate | null {
  const [top, second] = candidates
  if (!top || top.score === 0) return null
  if (!second) return top
  return top.score - second.score >= CONFIDENCE_MARGIN ? top : null
}
