---
name: triage-github-issue
description: Triage one specific GitHub issue by number. Claims it, checks for duplicates, runs /triage and one round of /grill-with-docs, leaves the outcome comment, and sets exactly one state label (ready-for-agent, ready-for-human or needs-info). Use when given an issue number to groom, or when triage-github-issues dispatches an issue to you.
---

# Triage GitHub issue

Make one issue ready for an agent to implement, or route it to a human.

**Input:** an issue number `N`.

**Read first:** the `github-workflow-protocol` skill (`.agents/skills/github-workflow-protocol/SKILL.md`, including **Interactive skills**: `/triage` and `/grill-with-docs` need its overrides), then its `references/labels.md`, `references/dedupe.md`, `references/issue-format.md`, `references/log.md` and `config.env`. If you have a shell, `source scripts/agent/lib.sh`.

## Eligibility

Check this first. If it fails, claim nothing and return `#N skipped: <reason>`.

- `N` is an open issue with **none** of: `ready-for-agent`, `ready-for-human`, `needs-info`, `agent:pr-open`, `agent:stuck`, `agent:log`. A human takes an issue out of `needs-info` by removing the label after answering; from then on it is eligible like any other.
- `needs-triage` does not exclude it. It means an earlier pass did not finish.
- If it carries `agent:triage` or `agent:in-progress` and `lease_live N` succeeds, someone has it: skip. A lease label with no live lease does not count.

## Outputs

- On the issue, exactly one state label after the pass:
  - `needs-info`: open questions remain (including a missing required section). Only a human removes this label.
  - `ready-for-agent`: an agent can implement from the issue, comments, images, ADRs and codebase.
  - `ready-for-human`: needs a human (product decision, access, judgment). Also used when `/triage` would recommend `wontfix` (the issue is not closed).
- An outcome comment as the last comment of the pass: an **Agent Brief**, **Triage Notes**, or the ready-for-human structure (see `/triage` and `references/handoff.md`).
- Optional description updates and minimized resolved comments.
- Lease released (`release N issue agent:triage`).

## Process

1. **Claim.** `claim N issue agent:triage Grooming "$LEASE_TTL_TRIAGE"`. Release on every exit path from here on (see step 10).
2. **Dedupe.** Follow `references/dedupe.md`, using the **Grooming** column. If your issue is a duplicate and is now closed, skip to step 10.
3. **Link related issues** in a comment, or in the description if that reads better.
4. **Check the format.** Decide the category, then compare the description with `references/issue-format.md` (its **Grooming's check** section). Fill in what the evidence supports. Note what is missing and cannot be inferred. Those become questions in step 6.
5. **Triage.** Run `/triage` on the issue and its comments, under the overrides in the protocol. It reads the code, checks for an existing implementation and for prior rejections, tries to reproduce a bug, and applies the category (`bug` or `enhancement`).
6. **Grill, one round.** Run `/grill-with-docs` under the same overrides. Work out the open decisions, look up every fact yourself, and post the questions that are ready to ask as **one comment, each with your recommended answer**. Do not wait for replies. Do not edit `GLOSSARY.md` or ADRs: list the proposed changes in the comment. Add a question for each required section missing in step 4. **For a feature, the use case is always a question if it is not already clear.**
7. **Update the description** as the discussion warrants. Minimize comments whose questions are now answered, with the classifier "Resolved".
8. **Outcome comment.** Post it as the **last comment** of this pass, in the format `/triage` defines for the state you are about to set: an **Agent Brief** for `ready-for-agent`; the same structure plus why it cannot be delegated for `ready-for-human`; **Triage Notes** for `needs-info`. This comment is the handoff for an issue (see `references/handoff.md`).
9. **Set the state.** One command that removes any old state label, **including `needs-triage`**, and adds exactly one of these:
   - `needs-info`: any question is open, **including a missing required section** from `references/issue-format.md`. A feature with no stated use case is never `ready-for-agent`. A missing screenshot alone never blocks.
   - `ready-for-agent`: an agent can get everything needed to implement from the issue, its comments, any images in them, the ADRs and the codebase.
   - `ready-for-human`: a human is needed (product decision, access, judgment call). Also use this when `/triage` recommends `wontfix`: do not close the issue, and say why in the outcome comment.
10. **Release.** `release N issue agent:triage`.

If any step fails, leave the state labels as they were, run `release N issue agent:triage`, and return `#N failed: <reason>`.

## Result

Return one line: `#N ready-for-agent`, `#N needs-info`, `#N ready-for-human`, `#N duplicate of #M`, `#N skipped: <reason>` or `#N failed: <reason>`. When a group skill called you, it logs the result. When you were run on your own, write a run-log entry for it (`references/log.md`).

## Never

- Write or change code, or touch PRs.
- Commit, or edit `GLOSSARY.md`, ADRs or `.out-of-scope/`.
- Close an issue as `wontfix`.
- Remove `needs-info`. Only a human does.
- Apply `ready-for-agent` while questions are open or a required section is missing.
- Modify an issue you have not claimed, except for the comments `references/dedupe.md` allows.
