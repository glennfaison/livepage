# Shepherding

Take a PR from "opened" to "reviewable": get checks green, address open review findings, then post the handoff. This step never polls. If checks are still running, it skips the PR and a later run picks it up.

**Read first:** `_shared/Labels.md`, `_shared/Protocol.md`, `_shared/Handoff.md`, `_shared/Escalate.md`, `_shared/Log.md`, `_shared/config.env`, `.agents/docs/AGENT-WORKFLOW.md`. Then `source scripts/agent/lib.sh` and `git config core.hooksPath scripts/git-hooks`.

## Inputs

- Open PRs labelled `agent:needs-work`, without `agent:stuck`, and without a live `agent:in-progress` lease.
- Oldest first, at most `$SHEPHERD_BATCH` per run.
- Check state must be `failing` or `green` (skip `pending` / `no-checks-yet`).
- When fixing: failing check logs and, if `open_findings N` > 0, the newest `kind=review` handoff comment.

Claims with `claim N pr agent:in-progress Shepherding "$LEASE_TTL_PR"`. Release on every exit path.

## Outputs

- Fix path: push a commit, post an attempt comment ending with `<!-- agent:attempt step=shepherding sha=<new head SHA> -->`; PR stays `agent:needs-work`.
- Ready path: "ready" handoff comment ending with `<!-- agent:handoff kind=ready sha=<head SHA> -->`; swap `agent:needs-work` → `agent:ready-for-review`.
- Escalation to `agent:stuck` when attempts exceed `$MAX_SHEPHERD_ATTEMPTS` or the PR is a fork (`_shared/Escalate.md`).
- Lease released. One log line (`_shared/Log.md`).

## Trigger

An open PR with `agent:needs-work`, no `agent:stuck`, and no live `agent:in-progress` lease. Oldest first, at most `$SHEPHERD_BATCH` per run.

```bash
gh pr list --state open --label agent:needs-work --limit 100 \
  --json number,title,createdAt,labels,isCrossRepository --jq '
  def names: [.labels[].name];
  [ .[] | select((names | any(. == "agent:stuck")) | not)
        | {number, title, createdAt, fork: .isCrossRepository} ] | sort_by(.createdAt)'
```

Then read the check state (ignore the command's exit code, which is non-zero while checks run):

```bash
gh pr checks N --json bucket --jq '[.[].bucket]
  | if length==0 then "no-checks-yet" elif any(.=="pending") then "pending"
    elif any(.=="fail" or .=="cancel") then "failing" else "green" end'
```

- `pending` or `no-checks-yet`: skip this PR. It will be eligible on a later run.
- `failing`: eligible.
- `green`: eligible.

## Process (per PR)

1. **Claim.** `claim N pr agent:in-progress Shepherding "$LEASE_TTL_PR"` Release on every exit path from here on: fixed, handed off, escalated or failed.
2. **Fork check.** `gh pr view N --json isCrossRepository`. If true, follow `_shared/Escalate.md` and stop.
3. **Decide what is needed:**
   - Checks `failing`, or `open_findings N` is above 0: go to step 4.
   - Checks `green` and `open_findings N` is 0: go to step 5.
4. **Fix.**
   1. If `shepherd_attempts N` is at least `$MAX_SHEPHERD_ATTEMPTS`, follow `_shared/Escalate.md` and stop.
   2. Read the failing logs (`gh run view <run-id> --log-failed`) and, if `open_findings N` is above 0, the newest `kind=review` handoff comment. If you cannot read enough of the failing output to find the cause, do not guess: record the PR under **Problems** in the log, go to step 6, and move on. This does not count as an attempt.
   3. Check out the PR branch and fix the cause. Run the narrowest relevant test first, as `AGENT-WORKFLOW.md` says.
   4. **Never edit tests, snapshots or allowlists to make a check pass.** If a test looks wrong, say so in the attempt comment and leave it.
   5. Push. Post a short comment on what you tried, ending with `<!-- agent:attempt step=shepherding sha=<new head SHA> -->`.
   6. The PR stays `agent:needs-work`. Do not wait for the new checks. Go to step 6.
5. **Hand off.** Post the "ready" handoff on the PR, as `_shared/Handoff.md` describes (changes, decisions, risks, verification, reviewer focus). The comment must end with `<!-- agent:handoff kind=ready sha=<head SHA> -->`. Then in one command: `gh pr edit N --remove-label agent:needs-work --add-label agent:ready-for-review`.
6. **Release and log.** `release N pr agent:in-progress`. Log one line for this PR (`_shared/Log.md`).

## Never

- Wait for CI to finish.
- Merge, approve or review. That is Reviewing's job.
- Apply `agent:ready-for-review` while checks are not green or findings are open.
