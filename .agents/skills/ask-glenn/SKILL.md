---
name: ask-glenn
description: Find the right LivePage skill and where to read its instructions. Use /ask-glenn when choosing a skill or unsure which workflow applies.
---

# Ask Glenn

Use `/ask-glenn` when you are unsure which skill applies. Invoke a skill by its
name, or read its linked `SKILL.md` for the full workflow; this navigator only
points you to the right instructions.

- [`/ask-glenn`](SKILL.md): choose a skill from this list.
- [`/agent-orchestration`](../agent-orchestration/SKILL.md): plan and build non-trivial features or tasks through design, implementation, and review.
- [`/code-review`](../code-review/SKILL.md): review current changes, a branch, or a pull request.
- [`/merge-safety`](../merge-safety/SKILL.md): decide whether a PR is safe for an agent to merge.
- [`/explore-github-repo`](../explore-github-repo/SKILL.md): explore the app and code, then file the best findings as issues (calls [`/file-github-issue`](../file-github-issue/SKILL.md)).
- [`/triage-github-issues`](../triage-github-issues/SKILL.md): triage all open issues (calls [`/triage-github-issue`](../triage-github-issue/SKILL.md) for each; use that one for a single issue number).
- [`/implement-github-issues`](../implement-github-issues/SKILL.md): implement the ready-for-agent issues (calls [`/implement-github-issue`](../implement-github-issue/SKILL.md)).
- [`/shepherd-github-prs`](../shepherd-github-prs/SKILL.md): get agent PRs through CI (calls [`/shepherd-github-pr`](../shepherd-github-pr/SKILL.md)).
- [`/review-github-prs`](../review-github-prs/SKILL.md): review and merge ready agent PRs (calls [`/review-github-pr`](../review-github-pr/SKILL.md)).
- [`/github-workflow-protocol`](../github-workflow-protocol/SKILL.md): shared rules for the GitHub skills above. Reference only; read it, do not run it.
- [`/template-authoring`](../template-authoring/SKILL.md): add, redesign, or fix a LivePage Template.
- [`/template-design-review`](../template-design-review/SKILL.md): evaluate and improve a Template's preview-mode design in the browser.
- [`/typesafe-ai`](../typesafe-ai/SKILL.md): build AI features using TypeSafe judgments and probabilities.
- [`/zip-branch-import`](../zip-branch-import/SKILL.md): import a patch and related assets from a zip archive.

Read `.agents/skills/fallow-skills/` to find additional skills related to Fallow analysis and review.
Read `.agents/skills/matt-pocock-skills/` to find additional skills related to Matt Pocock's work.
