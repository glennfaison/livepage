# Grooming

Make an issue ready for an agent to implement, or route it to a human.

**Read first:** `Labels.md`, `_shared/Protocol.md` (including **Interactive skills**: `/triage` and `/grill-with-docs` need its overrides), `_shared/Dedupe.md`, `_shared/IssueFormat.md`, `_shared/Log.md`, `_shared/config.env`. Then `source scripts/agent/lib.sh`.

## Trigger

An open issue is eligible when it has **none** of these labels: `ready-for-agent`, `ready-for-human`, `needs-info`, `agent:pr-open`, `agent:stuck`, `agent:log`. A human takes an issue out of `needs-info` by removing the label after answering; from then on it is eligible like any other.

`needs-triage` does not exclude an issue: it means an earlier pass did not finish.

Skip an issue that carries `agent:triage` or `agent:in-progress` if `lease_live N` succeeds. A lease label with no live lease does not count.

```bash
gh issue list --state open --limit 200 --json number,title,createdAt,labels --jq '
  def names: [.labels[].name];
  [ .[] | select((names | map(IN("agent:log","agent:stuck","agent:pr-open","needs-info","ready-for-agent","ready-for-human")) | any) | not)
        | {number, title, createdAt, labels: names} ] | sort_by(.createdAt)'
```

Work oldest first, at most `$GROOM_BATCH` issues per run.

### Housekeeping, before selecting

For each open issue labelled `agent:pr-open`, run `prs_for_issue N`:

- Any PR is `MERGED`: close the issue (`gh issue close N --comment "Implemented in #P."`).
- Any PR is `OPEN`: leave it alone.
- Every PR is `CLOSED` (none open or merged): the work was abandoned. In one command swap `agent:pr-open` for `ready-for-human`, and comment "PR #P was closed without merging. A human should decide whether to retry." Do not send it back to an agent: that is how the same fix gets re-attempted in a loop.
- No PR found at all: leave it alone and note it under **Problems** in the log.

This is the only place Grooming changes the state of an issue it has not claimed.

## Process (per issue)

1. **Claim.** `claim N issue agent:triage Grooming "$LEASE_TTL_TRIAGE"`. Release on every exit path from here on (see step 10).
2. **Dedupe.** Follow `_shared/Dedupe.md`. If your issue is a duplicate and is now closed, skip to step 10.
3. **Link related issues** in a comment, or in the description if that reads better.
4. **Check the format.** Decide the category, then compare the description with `_shared/IssueFormat.md`. Fill in what the evidence supports. Note what is missing and cannot be inferred. Those become questions in step 6.
5. **Triage.** Run `/triage` on the issue and its comments, under the overrides in `_shared/Protocol.md`. It reads the code, checks for an existing implementation and for prior rejections, tries to reproduce a bug, and applies the category (`bug` or `enhancement`).
6. **Grill, one round.** Run `/grill-with-docs` under the same overrides. Work out the open decisions, look up every fact yourself, and post the questions that are ready to ask as **one comment, each with your recommended answer**. Do not wait for replies. Do not edit `GLOSSARY.md` or ADRs: list the proposed changes in the comment. Add a question for each required section missing in step 4. **For a feature, the use case is always a question if it is not already clear.**
7. **Update the description** as the discussion warrants. Minimize comments whose questions are now answered, with the classifier "Resolved".
8. **Outcome comment.** Post it as the **last comment** of this pass, in the format `/triage` defines for the state you are about to set: an **Agent Brief** for `ready-for-agent`; the same structure plus why it cannot be delegated for `ready-for-human`; **Triage Notes** for `needs-info`. This comment is the handoff for an issue (see `_shared/Handoff.md`).
9. **Set the state.** One command that removes any old state label, **including `needs-triage`**, and adds exactly one of these:
   - `needs-info`: any question is open, **including a missing required section** from `_shared/IssueFormat.md`. A feature with no stated use case is never `ready-for-agent`. A missing screenshot alone never blocks.
   - `ready-for-agent`: an agent can get everything needed to implement from the issue, its comments, any images in them, the ADRs and the codebase.
   - `ready-for-human`: a human is needed (product decision, access, judgment call). Also use this when `/triage` recommends `wontfix`: do not close the issue, and say why in the outcome comment.
10. **Release and log.** `release N issue agent:triage`. Add one line for this issue to the run log (`_shared/Log.md`).

If any step fails for an issue, leave its state labels as they were, run `release N issue agent:triage`, record it under **Problems** in the log, and move to the next issue.

## Never

- Write or change code, or touch PRs.
- Commit, or edit `GLOSSARY.md`, ADRs or `.out-of-scope/`.
- Close an issue as `wontfix`.
- Remove `needs-info`. Only a human does.
- Apply `ready-for-agent` while questions are open or a required section is missing.
- Modify an issue you have not claimed, except for the comments `_shared/Dedupe.md` allows and the housekeeping above.
