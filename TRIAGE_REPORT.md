# Issue Triage Report

**Generated:** 2026-10-09T08:01:22Z  
**Total Open Issues:** 74

---

## Priority Classification

### 🔴 P0 - Critical Bugs (Blocking Core Functionality)
*Confirmed bugs with `ready-for-agent` label - fully specified, ready to fix immediately*

| # | Issue | Title | Age |
|---|-------|-------|-----|
| 138 | [#138](https://github.com/.../issues/138) | Hardcoded colors in page-component.tsx break theming | 3 days |
| 142 | [#142](https://github.com/.../issues/142) | No confirmation dialog before discarding changes | 3 days |
| 58 | [#58](https://github.com/.../issues/58) | Edit mode canvas drifts from preview mode layout | 5 days |
| 61 | [#61](https://github.com/.../issues/61) | Edit-mode component spacing looks odd (dividers, borders, control bar) | 5 days |

**Action:** Assign to agents immediately. These break core editing/preview workflow.

---

### 🟠 P1 - High-Impact Bugs (Need Verification)
*Recent bugs with `needs-triage` - reported recently, need quick verification*

| # | Issue | Title | Age |
|---|-------|-------|-----|
| 276 | [#276](https://github.com/.../issues/276) | Theme toggle icon doesn't update reactively in builder header | <1 day |
| 270 | [#270](https://github.com/.../issues/270) | Undo/Redo buttons in toolbar appear disabled when history exists | <1 day |
| 267 | [#267](https://github.com/.../issues/267) | Page title input doesn't save on Enter key or blur | <1 day |
| 265 | [#265](https://github.com/.../issues/265) | FAQ accordion not interactive on landing page | <1 day |

**Action:** Verify within 24h. If confirmed, promote to P0 and assign.

---

### 🟡 P2 - Ready-for-Agent Enhancements (Well-Specified)
*Enhancements with `ready-for-agent` - fully specified, can be picked up by agents now*

#### High Value (Core Features)
| # | Issue | Title | Area |
|---|-------|-------|------|
| 210 | [#210](https://github.com/.../issues/210) | Add component search/filter in command palette insert section | Command Palette |
| 208 | [#208](https://github.com/.../issues/208) | Improve error handling and user-friendly error messages | Error Handling |
| 206 | [#206](https://github.com/.../issues/206) | Add SEO/Open Graph meta tags to landing page | SEO |
| 204 | [#204](https://github.com/.../issues/204) | Add copy/paste functionality for components | Builder UX |
| 201 | [#201](https://github.com/.../issues/201) | Add responsive preview mode (mobile/tablet/desktop) to builder | Builder UX |
| 175 | [#175](https://github.com/.../issues/175) | Enhancement: Add self-contained HTML export mode | Export |
| 174 | [#174](https://github.com/.../issues/174) | Performance: Add caching for data source results | Performance |
| 168 | [#168](https://github.com/.../issues/168) | Component metadata inconsistencies across design components | Design System |
| 167 | [#167](https://github.com/.../issues/167) | Generated data source lacks TypeScript type safety | Type Safety |
| 165 | [#165](https://github.com/.../issues/165) | No rate limiting on data source test connections | Security/Perf |
| 159 | [#159](https://github.com/.../issues/159) | Console.error/console.warn statements in production code | Code Quality |
| 157 | [#157](https://github.com/.../issues/157) | TypeScript strict mode improvements needed | Type Safety |
| 155 | [#155](https://github.com/.../issues/155) | No loading states for export/import operations | UX |
| 154 | [#154](https://github.com/.../issues/154) | Missing accessibility attributes on some interactive elements | Accessibility |
| 153 | [#153](https://github.com/.../issues/153) | ThemeProvider hydration warning suppression may hide issues | Code Quality |
| 149 | [#149](https://github.com/.../issues/149) | Missing environment variable validation at runtime | Config |
| 147 | [#147](https://github.com/.../issues/147) | HTML export lacks CSP headers for external resources | Security |
| 145 | [#145](https://github.com/.../issues/145) | Missing keyboard shortcut for toolbar toggle | UX |
| 144 | [#144](https://github.com/.../issues/144) | History operations use inefficient JSON deep cloning | Performance |
| 140 | [#140](https://github.com/.../issues/140) | Toolbar position not persisted across sessions | UX |
| 132 | [#132](https://github.com/.../issues/132) | Constrain page width on large screens | Layout |
| 108 | [#108](https://github.com/.../issues/108) | Template catalog: Add search/filter and better categorization | Template Catalog |
| 103 | [#103](https://github.com/.../issues/103) | No component palette sidebar | Builder UX |
| 102 | [#102](https://github.com/.../issues/102) | Export functionality hidden in dropdown menu | Discoverability |
| 41 | [#41](https://github.com/.../issues/41) | Add new templates to the Template Catalog | Templates |
| 3 | [#3](https://github.com/.../issues/3) | Drag and drop components at any visible divider | Builder Core |

#### Medium Value (Polish/Quality)
| # | Issue | Title | Area |
|---|-------|-------|------|
| 214 | [#214](https://github.com/.../issues/214) | Improve template thumbnail display in catalog | Templates |
| 180 | [#180](https://github.com/.../issues/180) | Documentation: Add JSDoc comments to public APIs | Documentation |
| 179 | [#179](https://github.com/.../issues/179) | Testing: Add visual regression tests for templates | Testing |
| 178 | [#178](https://github.com/.../issues/178) | Accessibility: Add screen reader announcements for toolbar | Accessibility |
| 173 | [#173](https://github.com/.../issues/173) | UX: Add keyboard shortcuts cheatsheet | UX |
| 163 | [#163](https://github.com/.../issues/163) | TODO test not implemented: data source layout | Testing |
| 158 | [#158](https://github.com/.../issues/158) | Undo/redo shortcuts not discoverable in UI | UX |

**Action:** Queue for agent pickup. Prioritize by business value.

---

### 🔵 P3 - Needs-Triage Enhancements (Recent, Need Evaluation)
*New enhancements with `needs-triage` - reported today, need product/design review*

| # | Issue | Title | Area |
|---|-------|-------|------|
| 282 | [#282](https://github.com/.../issues/282) | Command Palette - verify all commands work and add component search | Command Palette |
| 281 | [#281](https://github.com/.../issues/281) | AI Assistant (Prompt Assist) - verify functionality and discoverability | AI Assistant |
| 279 | [#279](https://github.com/.../issues/279) | Page builder mode toggle (Edit/Preview) - verify functionality and persistence | Builder Core |
| 277 | [#277](https://github.com/.../issues/277) | Landing page CTA buttons use Button asChild with Link - verify accessibility | Accessibility |
| 275 | [#275](https://github.com/.../issues/275) | History panel in toolbar - verify functionality | History/Toolbar |
| 273 | [#273](https://github.com/.../issues/273) | Template catalog popover functionality needs verification | Template Catalog |
| 272 | [#272](https://github.com/.../issues/272) | Export Preview and Copy HTML require validation dialog even when no errors | Export |
| 269 | [#269](https://github.com/.../issues/269) | Toolbar buttons lack visible labels on mobile viewport | Mobile/Accessibility |
| 266 | [#266](https://github.com/.../issues/266) | Command palette shortcut hint missing on mobile view | Mobile/UX |

**Action:** Product/design review within 48h. Decide: promote to P2, close, or defer.

---

### 🟣 P4 - Blocked on Info/Design
*Issues with `needs-info` or `ready-for-human` - waiting on decisions*

| # | Issue | Title | Blocker |
|---|-------|-------|---------|
| 207 | [#207](https://github.com/.../issues/207) | Improve accessibility (ARIA labels, focus management, keyboard navigation) | needs-info |
| 176 | [#176](https://github.com/.../issues/176) | Enhancement: Add template versioning and migration | needs-info |
| 172 | [#172](https://github.com/.../issues/172) | Performance: Add virtualization for large component trees | needs-info |
| 160 | [#160](https://github.com/.../issues/160) | Accessibility: Missing ARIA attributes and keyboard navigation in toolbar | ready-for-human |
| 156 | [#156](https://github.com/.../issues/156) | Test coverage gaps for critical user workflows | ready-for-human |
| 151 | [#151](https://github.com/.../issues/151) | No multi-page rename/switch UI in builder | ready-for-human |
| 107 | [#107](https://github.com/.../issues/107) | Toolbar positioning issues on mobile viewport | ready-for-human |
| 103 | [#103](https://github.com/.../issues/103) | No component palette sidebar | ready-for-human |
| 25 | [#25](https://github.com/.../issues/25) | Redesign /try page builder experience | ready-for-human |

**Action:** Schedule design/product sync. Unblock or close.

---

### ⚪ P5 - Won't Fix
*Explicitly marked as not planned*

| # | Issue | Title |
|---|-------|-------|
| 213 | [#213](https://github.com/.../issues/213) | Add zoom controls for canvas |

**Action:** Close or archive.

---

## Summary by Priority

| Priority | Count | Description |
|----------|-------|-------------|
| P0 - Critical Bugs | 4 | Blocking core functionality, ready to fix |
| P1 - High-Impact Bugs | 4 | Recent bugs needing verification |
| P2 - Ready Enhancements | 36 | Well-specified, agent-ready |
| P3 - Needs Triage | 9 | New items needing product review |
| P4 - Blocked | 9 | Waiting on info/design decisions |
| P5 - Won't Fix | 1 | Explicitly deferred |

**Total:** 63 actionable (P0-P4) + 1 wontfix = 64 tracked

---

## Recommended Next Actions

1. **Immediate (Today):** Assign P0 bugs to agents. Verify P1 bugs.
2. **This Week:** Product review P3 items. Schedule design sync for P4 items.
3. **Ongoing:** Feed P2 items to agent queue based on capacity.
4. **Cleanup:** Close P5 (wontfix) with explanation.

---

## Agent Assignment Recommendations

| Agent Type | Suitable Issues |
|------------|-----------------|
| **Bug Fix Agent** | P0, P1 (once verified) |
| **Feature Agent** | P2 High Value (210, 208, 204, 201, 175, 174, 168, 167, 165, 159, 157, 149, 147, 144, 132, 108, 103, 102, 3) |
| **Polish Agent** | P2 Medium Value (214, 180, 179, 178, 173, 163, 158, 155, 154, 153, 145, 140) |
| **Design/Human Required** | P4 items (207, 176, 172, 160, 156, 151, 107, 25) |