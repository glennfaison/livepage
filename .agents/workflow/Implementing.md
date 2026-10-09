# Implementing

Implement one `ready-for-agent` issue and open a PR. Getting the PR through checks is **Shepherding's** job, not this step's. This step never waits on CI.

**Read first:** `Labels.md`, `_shared/Protocol.md`, `_shared/Escalate.md`, `_shared/IssueFormat.md`, `_shared/Log.md`, `_shared/config.env`, `AGENTS.md` and `.agents/docs/AGENT-WORKFLOW.md`. Then `source scripts/agent/lib.sh` and `git config core.hooksPath scripts/git-hooks`.

## Trigger

An open issue with `ready-for-agent` and neither `agent:stuck` nor a live `agent:in-progress` lease. Take the oldest, at most `$IMPLEMENT_BATCH` per run.

```bash
gh issue list --state open --label ready-for-agent --limit 100 --json number,title,createdAt,labels --jq '
  def names: [.labels[].name];
  [ .[] | select((names | any(. == "agent:stuck")) | not)
        | {number, title, createdAt, labels: names} ] | sort_by(.createdAt)'
```

If it has `agent:in-progress`, skip it when `lease_live N` succeeds.

## Process

1. **Claim.** `claim N issue agent:in-progress Implementing "$LEASE_TTL_IMPLEMENT"` Release on every exit path from here on: finished, bail-out, escalation or failure. **Leave `ready-for-agent` in place.** If this run dies, the issue is still `ready-for-agent` and the next run retries.
2. **Check for existing PRs. This is what prevents duplicates.** Before writing any code, run `prs_for_issue N` (all states). It finds PRs by the `agent:implements` marker, by a `<type>/N-<topic>` branch, and by `Closes|Fixes|Resolves #N`, so it also finds PRs made by the old workflow.
   - **Any `OPEN`:** do **not** start another. Make the labels right and stop: swap `ready-for-agent` for `agent:pr-open` on the issue, and if that PR carries the `agent:implements` marker and neither `agent:needs-work` nor `agent:ready-for-review`, add `agent:needs-work` to it. A PR without the marker was written by a human: leave its labels alone. Log it ("existing PR #P"). Release and stop for this issue.
   - **Any `MERGED`:** the work has shipped. `gh issue close N --comment "Implemented in #P."`, remove `ready-for-agent`, log, release and stop.
   - **Only `CLOSED`:** an earlier PR was abandoned. Do not try again on your own. Comment with the PR number, swap `ready-for-agent` for `ready-for-human`, log, release and stop.
   - **None:** continue. If a branch for the issue already exists (`git ls-remote --heads origin "*/N-*"`), check it out and carry on from it.
3. **Read context.** Find the latest `## Agent Brief` comment. **It is the contract**; the description and discussion are context. If there is no brief, the description may itself be the specification (an issue filed from the "Ready for agent" template has acceptance criteria and no brief). Then read the open comments, the ADRs it links, and the relevant code. **View every image** in the issue and its comments (screenshots, mockups): for a feature they show the intended result. Read the use case first, and build for it rather than for the letter of the proposal.
4. **Bail out if the issue is not actually ready.** If you find missing information or a decision only a human can make, post a comment in the **Triage Notes** format from `/triage` (what is established, what is still needed, specific questions) and swap `ready-for-agent` for `needs-info` (or `ready-for-human`). Log it and stop for this issue.
5. **Implement.** Branch name: `feature/N-<topic>` or `bugfix/N-<topic>` (lowercase kebab-case, from `.agents/docs/BRANCH-NAMES.md`). Run `/implement` on the brief: it uses `/tdd`, typechecks as it goes, runs the full suite once, and calls `/code-review`. Use `/implement-spec` instead only if the issue belongs to a spec with a ticket graph. For anything beyond a focused fix, follow the agent-orchestration skill, as `AGENT-WORKFLOW.md` says. Follow the **Verify** checklist in `AGENT-WORKFLOW.md`. Escalate (`_shared/Escalate.md`) if you hit a blocker you cannot resolve.
6. **Open the PR.** First run `prs_for_issue N` again: another run may have opened one while you worked. If an `OPEN` PR now exists, stop and do not create another. Otherwise `gh pr create --base "$PR_BASE_BRANCH"` with a body that links the issue using `Closes #N.` (one `Closes` statement per issue, as `AGENTS.md` requires) and ends with the line `<!-- agent:implements issue=N -->`.
7. **Transition.** Add `agent:needs-work` to the PR. On the issue, run one command: `gh issue edit N --remove-label ready-for-agent --add-label agent:pr-open`. Then `release N issue agent:in-progress`.
8. **Log it** (`_shared/Log.md`).

## Never

- Wait for checks, fix CI, or post the reviewer handoff. Shepherding does that.
- Push to `main`, or open a PR against `main`.
- Remove `ready-for-agent` before the PR exists.
- Open a second PR for an issue that already has an `OPEN` one, whoever opened it.
