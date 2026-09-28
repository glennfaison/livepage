import { pageTemplateRegistry, getPageTemplateById, cloneTemplatePages, createApplyTemplateActions } from "@/features/templates"
import {
  extractPageBrief,
  rankTemplateCandidates,
  pickConfidentMatch,
  applyPromptFieldValues,
  createApplyPromptTemplateActions,
  matchRequestSchema,
  draftRequestSchema,
  promptDraftSchema,
} from "@/features/prompt-assist"
import { decideTemplateMatch, generateCopyDraft } from "@/features/prompt-assist/server"

describe("extractPageBrief", () => {
  it("pulls tone and color hints out of a free-form prompt", () => {
    const brief = extractPageBrief("A dark, minimal résumé site — professional but a little playful")
    expect(brief.colorHints).toContain("dark")
    expect(brief.toneHints).toEqual(expect.arrayContaining(["minimal", "professional", "playful"]))
  })

  it("extracts a quoted name and a profession-shaped headline", () => {
    const brief = extractPageBrief('Build a page for "Priya Shah", I am a backend engineer')
    expect(brief.name).toBe("Priya Shah")
    expect(brief.headline).toBe("backend engineer")
  })

  it("never throws and always returns a brief for empty or odd input", () => {
    expect(() => extractPageBrief("")).not.toThrow()
    expect(extractPageBrief("   ").rawPrompt).toBe("")
  })
})

describe("rankTemplateCandidates / pickConfidentMatch", () => {
  it("confidently distinguishes the dark and light engineer CV variants", () => {
    const brief = extractPageBrief("I need a dark resume site for a software engineer")
    const candidates = rankTemplateCandidates(brief, pageTemplateRegistry)
    const top = pickConfidentMatch(candidates)
    expect(top?.templateId).toBe("cv-resume-engineer-dark")
  })

  it("treats a near-tied request as ambiguous rather than guessing", () => {
    // "case studies" scores portfolio-personal-site and agency-homepage
    // equally (both list it in their tags/description), so neither wins by
    // the confidence margin.
    const brief = extractPageBrief("case studies")
    const candidates = rankTemplateCandidates(brief, pageTemplateRegistry)
    expect(pickConfidentMatch(candidates)).toBeNull()
    const ids = candidates.map((candidate) => candidate.templateId)
    expect(ids).toEqual(expect.arrayContaining(["portfolio-personal-site", "agency-homepage"]))
  })

  it("bridges casual phrasing through the synonym dictionary", () => {
    const brief = extractPageBrief("Landing page for my new SaaS startup")
    const candidates = rankTemplateCandidates(brief, pageTemplateRegistry)
    expect(candidates[0]?.templateId).toBe("landing-page-saas")
  })
})

describe("applyPromptFieldValues / createApplyPromptTemplateActions", () => {
  it("writes name/headline/summary onto the template's existing dataMapping targets", () => {
    const template = getPageTemplateById("cv-resume-engineer-dark")
    expect(template).toBeDefined()

    const pages = cloneTemplatePages(template!)
    const updated = applyPromptFieldValues(pages, template!, {
      name: "Priya Shah",
      headline: "Backend engineer",
    })

    const serialized = JSON.stringify(updated)
    expect(serialized).toContain("Priya Shah")
    expect(serialized).toContain("Backend engineer")
  })

  it("produces one SET_PAGES batch with a single history entry", () => {
    const template = getPageTemplateById("landing-page-saas")
    expect(template).toBeDefined()

    const actions = createApplyPromptTemplateActions(template!, { name: "Northwind" }, "Applied from chat")
    expect(actions.filter((action) => action.type === "ADD_TO_HISTORY")).toHaveLength(1)
    expect(actions.filter((action) => action.type === "UPDATE_COMPONENT")).toHaveLength(0)
    expect(actions[0]).toMatchObject({ type: "SET_PAGES" })
  })
})

describe("decideTemplateMatch (server) without a TypeSafe key", () => {
  const originalKey = process.env.TYPESAFE_API_KEY

  beforeEach(() => {
    delete process.env.TYPESAFE_API_KEY
  })

  afterEach(() => {
    if (originalKey) process.env.TYPESAFE_API_KEY = originalKey
  })

  it("falls back to the top deterministic candidate instead of throwing", async () => {
    const brief = extractPageBrief("case studies")
    const { match, candidates } = await decideTemplateMatch(brief, pageTemplateRegistry)
    expect(candidates.length).toBeGreaterThan(0)
    expect(match.decidedBy).toBe("jev-unavailable")
    expect(candidates.some((candidate) => candidate.templateId === match.templateId)).toBe(true)
  })
})

describe("generateCopyDraft (server) without an OpenAI key", () => {
  const originalKey = process.env.OPENAI_API_KEY

  beforeEach(() => {
    delete process.env.OPENAI_API_KEY
  })

  afterEach(() => {
    if (originalKey) process.env.OPENAI_API_KEY = originalKey
  })

  it("falls back to the brief's own name/headline instead of throwing", async () => {
    const template = getPageTemplateById("cv-resume-personal-website")
    expect(template).toBeDefined()

    const brief = extractPageBrief('A page for "Priya Shah", I am a backend engineer')
    const result = await generateCopyDraft(brief, template!)
    expect(result.source).toBe("fallback")
    expect(result.draft.name).toBe("Priya Shah")
    expect(result.draft.headline).toBe("backend engineer")
  })
})

describe("extractPageBrief regressions", () => {
  it("stops the headline before 'named X' (README example)", () => {
    const brief = extractPageBrief("a dark, minimal résumé site for a backend engineer named Priya")
    expect(brief.name).toBe("Priya")
    expect(brief.headline).toBe("backend engineer")
  })

  it("keeps non-ASCII names intact", () => {
    expect(extractPageBrief("a page named José García, I am a designer").name).toBe("José García")
  })

  it("does not swallow the rest of the sentence into the name", () => {
    expect(extractPageBrief("a site called Acme Corp and it sells shoes online").name).toBe("Acme Corp")
  })
})

describe("prompt-assist schemas", () => {
  it("rejects whitespace-only prompts at the boundary instead of failing later", () => {
    expect(matchRequestSchema.safeParse({ prompt: "   " }).success).toBe(false)
    expect(draftRequestSchema.safeParse({ prompt: "  ", templateId: "x" }).success).toBe(false)
  })

  it("does not accept a client-supplied brief on the draft request", () => {
    const parsed = draftRequestSchema.parse({ prompt: "a resume", templateId: "x", brief: { rawPrompt: "evil" } })
    expect(parsed).not.toHaveProperty("brief")
  })

  it("caps model-written draft fields", () => {
    expect(promptDraftSchema.safeParse({ summary: "x".repeat(10_000) }).success).toBe(false)
  })
})

describe("ranking without overlap", () => {
  it("reports an arbitrary match as a zero-confidence fallback, not a keyword match", async () => {
    delete process.env.TYPESAFE_API_KEY
    const brief = extractPageBrief("xyzzy plugh")
    const { match } = await decideTemplateMatch(brief, pageTemplateRegistry)
    expect(match).toMatchObject({ decidedBy: "fallback", confidence: 0 })
  })

  it("ignores stop words so 'a website for my ...' alone can't win a template", () => {
    const candidates = rankTemplateCandidates(extractPageBrief("I want a website for my"), pageTemplateRegistry)
    expect(candidates.every((candidate) => candidate.score === 0)).toBe(true)
  })

  it("does not report a minimum-margin win as 100% confident", async () => {
    delete process.env.TYPESAFE_API_KEY
    const brief = extractPageBrief("I need a dark resume site for a software engineer")
    const { match } = await decideTemplateMatch(brief, pageTemplateRegistry)
    expect(match.decidedBy).toBe("deterministic")
    expect(match.confidence).toBeLessThan(1)
  })
})

describe("createApplyTemplateActions options", () => {
  it("applies a custom history label and page customization", () => {
    const template = getPageTemplateById("landing-page-saas")!
    const actions = createApplyTemplateActions(template, { historyLabel: "Custom", customizePages: (pages) => pages.slice(0, 1) })
    const history = actions.find((action) => action.type === "ADD_TO_HISTORY")
    expect(history).toMatchObject({ payload: { action: "Custom" } })
  })
})
