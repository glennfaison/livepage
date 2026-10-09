# Reviewing

Review one PR and merge it if an agent can safely do so. If not, record why and, when the fix is small, fix it.

**Read first:** `_shared/Labels.md`, `_shared/Protocol.md`, `_shared/Handoff.md`, `_shared/Escalate.md`, `_shared/Log.md`, `_shared/config.env`. Then `source scripts/agent/lib.sh` and `git config core.hooksPath scripts/git-hooks`.

## Inputs

- Open, non-draft PRs labelled `agent:ready-for-review`, without `agent:stuck`, and without a live `agent:in-progress` lease.
- Oldest first, at most `$REVIEW_BATCH` per run.
- Head SHA must match `ready_sha N` and checks must be green; otherwise the PR is not ready.
- PR title, body, comments, linked issue(s); merge-safety and code-review skills run against the pinned SHA.

Claims with `claim N pr agent:in-progress Reviewing "$LEASE_TTL_PR"`. Release on every exit path.

## Outputs

- Mergeable: merge pinned to the reviewed SHA (`gh pr merge N --match-head-commit "$SHA" --"$MERGE_METHOD"`); for each linked issue, remove `agent:pr-open` and close with "Implemented in #N."
- Not mergeable: optional small fix (no design decision, only code this PR already changes); "review" handoff ending with `<!-- agent:handoff kind=review sha=$SHA open=<unfixed count> -->`; swap `agent:ready-for-review` → `agent:needs-work`.
- Escalation to `agent:stuck` if `review_rounds N` ≥ `$MAX_REVIEW_ROUNDS` or the PR is a fork.
- Lease released. One log line (`_shared/Log.md`).

## Trigger

An open, non-draft PR with `agent:ready-for-review`, no `agent:stuck`, and no live `agent:in-progress` lease. Oldest first, at most `$REVIEW_BATCH` per run.

```bash
gh pr list --state open --label agent:ready-for-review --limit 100 \
  --json number,title,createdAt,labels,isDraft,isCrossRepository --jq '
  def names: [.labels[].name];
  [ .[] | select((.isDraft | not) and ((names | any(. == "agent:stuck")) | not))
        | {number, title, createdAt, fork: .isCrossRepository} ] | sort_by(.createdAt)'
```

## Process (per PR)

1. **Claim.** `claim N pr agent:in-progress Reviewing "$LEASE_TTL_PR"` Release on every exit path from here on: merged, sent back, escalated or failed.
2. **Pin the head.** `SHA=$(gh pr view N --json headRefOid --jq .headRefOid)`. Everything below applies to this commit and no other.
3. **Fork check.** If `isCrossRepository` is true, follow `_shared/Escalate.md` and stop.
4. **Confirm the state is true.** If checks are not all green, or `ready_sha N` is not equal to `$SHA` (someone pushed after the handoff), the PR is not ready. Swap `agent:ready-for-review` for `agent:needs-work`, log it, and stop for this PR. Shepherding will re-verify.
5. **Review.** Read the PR title, body, comments and the linked issue. Run the **merge-safety** skill and the **code-review** skill against `$SHA`.
6. **Decide.**
   - **Mergeable.** Merge pinned to the reviewed commit: `gh pr merge N --match-head-commit "$SHA" --"$MERGE_METHOD"`. If someone pushed meanwhile, the merge fails: do not retry. If your tools cannot pin a merge to a commit, re-read the head SHA immediately before merging and stop if it is not `$SHA`. Then, for each issue `M` printed by `issue_for_pr N`: `gh issue edit M --remove-label agent:pr-open` and `gh issue close M --comment "Implemented in #N."`. GitHub normally closes the issue itself from `Closes #M` when the PR merges into the default branch (`develop`). Close it explicitly anyway: it does no harm if already closed, and it covers a PR whose body lacked the keyword. Log it. Done.
   - **Not mergeable.** Continue to step 7.
7. **Not mergeable: fix what is small, record the rest.**
   1. If `review_rounds N` is at least `$MAX_REVIEW_ROUNDS`, follow `_shared/Escalate.md` and stop. Do not start another round.
   2. Fix only findings that need **no design decision** and touch code this PR already changes. Check out the PR branch, run the narrowest relevant test first, push. **Never edit tests, snapshots or allowlists to get green.** Flag them instead.
   3. Post the "review" handoff, as `_shared/Handoff.md` describes: each finding, whether you fixed it, and what remains. End the comment with `<!-- agent:handoff kind=review sha=$SHA open=<number of findings still unfixed> -->`.
   4. In one command: `gh pr edit N --remove-label agent:ready-for-review --add-label agent:needs-work`. This applies whether or not you pushed. After any push, checks must run again before the PR can be reviewed again.
8. **Release and log.** `release N pr agent:in-progress`. Log one line for this PR (`_shared/Log.md`).

## Never

- Merge in the same run in which you pushed a commit. A fresh Reviewing run must review the new head.
- Merge anything other than the pinned `$SHA`.
- Retry a failed merge in the same run.
- Merge a fork PR, a draft, or a PR labelled `agent:stuck`.
