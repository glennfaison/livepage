# Protocol

Every step file starts by pointing here. Read it once per run. The commands below are implemented, and tested against a stubbed `gh`, in `scripts/agent/lib.sh`.

```bash
source scripts/agent/lib.sh   # loads _shared/config.env, sets RUN_ID, defines the helpers
```

Requires `gh` (authenticated), `jq` and GNU `date`.

## Rules every step follows

1. **Select by label, never by schedule.** Do not assume another step has run, will run, or is running. Look only at the item's labels and comments.
2. **Claim before acting. Release always.** Release on success and on failure. Do it explicitly: each command may run in its own shell, so a shell `trap` cannot be relied on. A crashed run is covered by lease expiry.
3. **Be idempotent.** Before creating a branch, PR, issue or comment, check whether it already exists. Rerunning a step on the same item must be safe.
4. **Write the output state before releasing the lease.** If a run dies midway, the item stays in its input state and the next run retries it.
5. **Stay bounded.** Handle at most the step's `*_BATCH` items (see `_shared/config.env`). One item failing does not stop the rest. Log it and move on.
6. **Nothing eligible: log one line and exit.** Never invent work.
7. **Touch only what you have claimed.** The only exceptions are the comments Dedupe allows on other issues.

## Interactive skills

`/triage` and `/grill-with-docs` were written for a maintainer at the keyboard: they "wait for direction", wait for answers, and update `GLOSSARY.md` and ADRs inline. `/implement` and `/implement-spec` assume a branch to commit to. No human is present in a workflow run, so follow the skill, with these overrides:

1. **The step file is your direction.** Do not stop to wait for a reply.
2. **One round, then `needs-info`.** Where a skill would ask a human something, put every question that is ready to ask into a single comment, with your recommended answer for each. Look up every fact yourself first. Then set `needs-info` and finish. A human answers and removes the label, and the next Grooming pass continues.
3. **Grooming and Exploring do not change the repository.** No commits, no branches, no edits to `GLOSSARY.md`, ADRs or `.out-of-scope/`. Put proposed changes in a comment.
4. **No unattended `wontfix`.** If a skill concludes a request is already implemented or should be rejected, do not close it. Set `ready-for-human` and give the recommendation and reason in the comment. (The triage skill itself says a human confirms matches against prior rejections.)
5. **Keep a skill's mandatory text.** Comments `/triage` writes must begin with its AI disclaimer.

## Leases

A lease is **live** only if the item carries the lease label **and** the newest `agent:lease` marker comment has not expired. Anything else counts as unleased. This includes a label with no marker, a label with an expired marker, and a missing label.

| Helper | Does |
|---|---|
| `has_label N issue\|pr LABEL` | exit 0 if N currently carries LABEL |
| `lease_live N` | exit 0 if the newest lease marker on N is unexpired |
| `claim N issue\|pr LABEL STEP TTL` | add the label, post a lease marker |
| `renew N issue\|pr STEP TTL` | post a newer marker. Do this before the lease runs out, if a long task needs it |
| `release N issue\|pr LABEL` | remove the label |

TTLs are `LEASE_TTL_TRIAGE`, `LEASE_TTL_IMPLEMENT` and `LEASE_TTL_PR` in `config.env`.

Typical use:

```bash
if has_label "$N" issue agent:triage && lease_live "$N"; then continue; fi   # someone has it
claim "$N" issue agent:triage Grooming "$LEASE_TTL_TRIAGE"
# ... work ...
release "$N" issue agent:triage                                       # on EVERY way out: success, bail-out, escalation, failure
```

Concurrency is best-effort. Two runs can claim the same item in the same second. This is accepted: every step is idempotent, so the worst case is duplicated work.

## Markers

Hidden HTML comments make state readable without parsing prose. Append them as the last line of the comment they belong to. Exception: `agent:implements` lives in the PR description. Never put markers in an issue description.

| Marker | Written by | Used for |
|---|---|---|
| `<!-- agent:lease step=… run=… expires=… -->` | `claim`, `renew` | lease expiry |
| `<!-- agent:implements issue=N -->` | Implementing, in the **PR description** | links a PR to its issue, so a second PR is never opened for it (`prs_for_issue N`) |
| `<!-- agent:handoff kind=ready sha=… -->` | Shepherding | the PR was reviewable at this head SHA |
| `<!-- agent:handoff kind=review sha=… open=N -->` | Reviewing, when it does not merge; `N` = findings still unfixed | counts review rounds (`review_rounds N`); `open_findings N` tells Shepherding what is left |
| `<!-- agent:attempt step=shepherding sha=… -->` | Shepherding, after each fix push | counts attempts since the last handoff of any kind (`shepherd_attempts N`) |

## Reading and writing helpers

| Helper | Does |
|---|---|
| `markers N` | every agent marker on N, in order |
| `prs_for_issue N` | every PR for issue N, one `<number> <OPEN\|MERGED\|CLOSED>` per line. Matches the `agent:implements` marker, a `<type>/N-<topic>` branch, or `Closes\|Fixes\|Resolves #N` in the body |
| `issue_for_pr N` | the issue numbers PR N implements |
| `review_rounds N`, `shepherd_attempts N` | the two counters above |
| `open_findings N` | review findings still open on a PR (0 if none) |
| `ready_sha N` | head SHA recorded by the newest `kind=ready` handoff |
| `log_issue`, `log_run FILE`, `read_logs DAYS` | see `_shared/Log.md` |
