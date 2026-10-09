# Issue Triage Report
**Generated:** 2026-10-09T13:01:53Z
**Total Open Issues:** 71 (excluding agent log #302)

---

## Priority Matrix

| Priority | Category | Count | Action |
|----------|----------|-------|--------|
| **P0** | Critical Bugs (ready-for-agent) | 8 | Immediate agent assignment |
| **P1** | High-Priority Bugs (ready-for-human) | 1 | Human review needed |
| **P2** | Actionable Enhancements (ready-for-agent) | 32 | Queue for agent work |
| **P3** | Enhancements Needing Human (ready-for-human) | 12 | Human design/decision required |
| **P4** | Blocked (needs-info) | 6 | Awaiting clarification |
| **P5** | Won't Fix | 1 | Close/no action |

---

## P0 — Critical Bugs (Ready for Agent)
*These break core functionality and are fully specified for immediate agent implementation.*

| # | Title | Age | Labels |
|---|-------|-----|--------|
| **276** | Theme toggle icon doesn't update reactively in builder header | 2 days | bug, ready-for-agent |
| **270** | Undo/Redo buttons in toolbar appear disabled when history exists | 2 days | bug, ready-for-agent |
| **267** | Page title input doesn't save on Enter key or blur | 2 days | bug, ready-for-agent |
| **265** | FAQ accordion not interactive on landing page | 2 days | bug, ready-for-agent |
| **142** | No confirmation dialog before discarding changes | 3 days | bug, ready-for-agent, agent:triage |
| **138** | Hardcoded colors in page-component.tsx break theming | 3 days | bug, ready-for-agent, agent:triage |
| **61** | Edit-mode component spacing looks odd (dividers, borders, control bar) | 5 days | bug, ready-for-agent, agent:triage |
| **58** | Edit mode canvas drifts from preview mode layout | 5 days | bug, ready-for-agent, agent:triage |

**Recommended Order:** #138 (theming breakage) → #58 (edit/preview drift) → #61 (spacing) → #276 (theme toggle) → #270 (undo/redo) → #267 (title input) → #265 (FAQ) → #142 (confirmation dialog)

---

## P1 — High-Priority Bugs (Ready for Human)
*Bugs requiring human design decisions or verification.*

| # | Title | Age | Labels |
|---|-------|-----|--------|
| **299** | Buggy UI in Template Catalog popover shows 1 tile per row instead of 3 in grid view mode | 2 days | bug, ready-for-human |

---

## P2 — Actionable Enhancements (Ready for Agent)
*Well-specified enhancements ready for autonomous agent implementation. Sorted by age (oldest first = higher priority).*

| # | Title | Age | Labels |
|---|-------|-----|--------|
| **3** | User should be able to drag a component and drop it at any visible divider or empty layout component | 132 days | enhancement, ready-for-agent, agent:triage |
| **41** | Add new templates to the Template Catalog (evergreen) | 14 days | enhancement, ready-for-agent, evergreen, agent:triage |
| **102** | Export functionality hidden in dropdown menu - low discoverability | 5 days | enhancement, ready-for-agent, agent:triage |
| **108** | Template catalog: Add search/filter and better categorization | 4 days | enhancement, ready-for-agent, agent:triage |
| **132** | Constrain page width on large screens so the floating toolbar does not overlap the canvas | 3 days | enhancement, ready-for-agent, agent:triage |
| **140** | Toolbar position not persisted across sessions | 3 days | enhancement, ready-for-agent, agent:triage |
| **144** | History operations use inefficient JSON deep cloning | 3 days | enhancement, ready-for-agent, agent:triage |
| **145** | Missing keyboard shortcut for toolbar toggle | 3 days | enhancement, ready-for-agent, agent:triage |
| **147** | HTML export lacks CSP headers for external resources | 3 days | enhancement, ready-for-agent, agent:triage |
| **149** | Missing environment variable validation at runtime | 3 days | enhancement, ready-for-agent, agent:triage |
| **153** | ThemeProvider hydration warning suppression may hide issues | 3 days | enhancement, ready-for-agent, agent:triage |
| **154** | Missing accessibility attributes on some interactive elements | 3 days | enhancement, ready-for-agent, agent:triage |
| **155** | No loading states for export/import operations | 3 days | enhancement, ready-for-agent, agent:triage |
| **157** | TypeScript strict mode improvements needed | 3 days | enhancement, ready-for-agent, agent:triage |
| **158** | Undo/redo shortcuts not discoverable in UI | 3 days | enhancement, ready-for-agent, agent:triage |
| **159** | Console.error/console.warn statements in production code should be removed or replaced | 3 days | enhancement, ready-for-agent, agent:triage |
| **163** | TODO test not implemented: data source layout | 3 days | enhancement, ready-for-agent, agent:triage |
| **165** | No rate limiting on data source test connections | 3 days | enhancement, ready-for-agent, agent:triage |
| **167** | Generated data source lacks TypeScript type safety | 3 days | enhancement, ready-for-agent, agent:triage |
| **168** | Component metadata inconsistencies across design components | 3 days | enhancement, ready-for-agent, agent:triage |
| **173** | UX: Add keyboard shortcuts cheatsheet | 3 days | enhancement, ready-for-agent, agent:triage |
| **174** | Performance: Add caching for data source results | 3 days | enhancement, ready-for-agent, agent:triage |
| **175** | Enhancement: Add self-contained HTML export mode | 3 days | enhancement, ready-for-agent, agent:triage |
| **178** | Accessibility: Add screen reader announcements for toolbar | 3 days | enhancement, ready-for-agent, agent:triage |
| **179** | Testing: Add visual regression tests for templates | 3 days | enhancement, ready-for-agent, agent:triage |
| **180** | Documentation: Add JSDoc comments to public APIs | 3 days | enhancement, ready-for-agent, agent:triage |
| **201** | Add responsive preview mode (mobile/tablet/desktop) to builder | 2 days | enhancement, ready-for-agent, agent:triage |
| **202** | Add onboarding/tutorial for first-time users | 2 days | enhancement, ready-for-agent, agent:triage |
| **204** | Add copy/paste functionality for components | 2 days | enhancement, ready-for-agent, agent:triage |
| **206** | Add SEO/Open Graph meta tags to landing page | 2 days | enhancement, ready-for-agent, agent:triage |
| **208** | Improve error handling and user-friendly error messages | 2 days | enhancement, ready-for-agent, agent:triage |
| **210** | Add component search/filter in command palette insert section | 2 days | enhancement, ready-for-agent, agent:triage |

---

## P3 — Enhancements Needing Human (Ready for Human)
*Enhancements requiring human design decisions, UX review, or product direction.*

| # | Title | Age | Labels |
|---|-------|-----|--------|
| **25** | Redesign /try page builder experience | 19 days | enhancement, ready-for-human, agent:triage |
| **103** | No component palette sidebar - only 'Add Row' button available in canvas | 4 days | enhancement, ready-for-human, agent:triage |
| **107** | Toolbar positioning issues on mobile viewport | 4 days | enhancement, ready-for-human, agent:triage |
| **151** | No multi-page rename/switch UI in builder | 3 days | enhancement, ready-for-human, agent:triage |
| **156** | Test coverage gaps for critical user workflows | 3 days | enhancement, ready-for-human, agent:triage |
| **160** | Accessibility: Missing ARIA attributes and keyboard navigation in toolbar | 3 days | enhancement, ready-for-human, agent:triage |
| **273** | Template catalog popover functionality needs verification | 2 days | enhancement, ready-for-human |
| **275** | History panel in toolbar - verify functionality | 2 days | enhancement, ready-for-human |
| **277** | Landing page CTA buttons use Button asChild with Link - verify accessibility | 2 days | enhancement, ready-for-human |
| **279** | Page builder mode toggle (Edit/Preview) - verify functionality and persistence | 2 days | enhancement, ready-for-human |
| **281** | AI Assistant (Prompt Assist) - verify functionality and discoverability | 2 days | enhancement, ready-for-human |
| **282** | Command Palette - verify all commands work and add component search | 2 days | enhancement, ready-for-human |

---

## P4 — Blocked (Needs Info)
*Cannot proceed without clarification from reporter.*

| # | Title | Age | Labels |
|---|-------|-----|--------|
| **172** | Performance: Add virtualization for large component trees | 3 days | enhancement, needs-info, agent:triage |
| **176** | Enhancement: Add template versioning and migration | 3 days | enhancement, needs-info, agent:triage |
| **207** | Improve accessibility (ARIA labels, focus management, keyboard navigation) | 2 days | enhancement, needs-info, agent:triage |
| **266** | Command palette shortcut hint missing on mobile view | 2 days | enhancement, needs-info |
| **269** | Toolbar buttons lack visible labels on mobile viewport | 2 days | enhancement, needs-info |
| **272** | Export Preview and Copy HTML require validation dialog even when no errors | 2 days | enhancement, needs-info |

---

## P5 — Won't Fix
*Explicitly marked as not being worked on.*

| # | Title | Age | Labels |
|---|-------|-----|--------|
| **213** | Add zoom controls for canvas | 2 days | enhancement, wontfix, ready-for-agent, agent:triage |

---

## Non-Issue
| # | Title | Note |
|---|-------|------|
| **302** | Agent log 2026-10 | Internal logging, not a real issue |

---

## Recommended Next Actions

1. **Immediate (This Sprint):** Assign P0 bugs to agents. Start with #138, #58, #61 (oldest, foundational).
2. **This Week:** Human review for P1 (#299) and P3 items needing design decisions.
3. **Backlog Grooming:** Prioritize P2 enhancements by user impact. #3 (drag-drop) is oldest and high-value.
4. **Unblock:** Reach out to reporters for P4 issues to clarify requirements.
5. **Close:** #213 (wontfix) and #302 (log) can be closed.

---

## Label Distribution Summary

| Label | Count |
|-------|-------|
| enhancement | 58 |
| ready-for-agent | 44 |
| ready-for-human | 14 |
| agent:triage | 43 |
| bug | 9 |
| needs-info | 6 |
| wontfix | 1 |
| evergreen | 1 |
| agent:log | 1 |