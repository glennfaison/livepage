#!/usr/bin/env bash
# Shared helpers for the agent workflow (.agents/workflow/_shared/Protocol.md).
# Usage: source scripts/agent/lib.sh
# Requires: gh (authenticated), jq, GNU date.

AGENT_ROOT="$(git rev-parse --show-toplevel)"
# shellcheck disable=SC1091
source "$AGENT_ROOT/.agents/workflow/_shared/config.env"

RUN_ID="${RUN_ID:-$(date -u +%Y%m%dT%H%M%SZ)-$$}"
export RUN_ID

# ---- Leases -------------------------------------------------------------
# A lease is live iff the item carries its lease label AND the newest lease
# marker comment has not expired. Callers check the label; this checks expiry.

# has_label <number> <issue|pr> <label>  -> exit 0 if the item currently carries the label
has_label() { gh "$2" view "$1" --json labels --jq '.labels[].name' | grep -qx -- "$3"; }

# lease_live <number>  -> exit 0 if the newest lease marker is unexpired
lease_live() {
  local exp
  exp=$(gh api "repos/{owner}/{repo}/issues/$1/comments" --paginate \
        --jq '.[] | .body | capture("<!-- agent:lease [^>]*expires=(?<e>[0-9TZ:-]+)") | .e' \
        | tail -n1)
  [ -n "$exp" ] && [ "$(date -u +%s)" -lt "$(date -u -d "$exp" +%s)" ]
}

# claim <number> <issue|pr> <label> <step> <ttl>   e.g. claim 12 issue agent:triage Grooming "$LEASE_TTL_TRIAGE"
claim() {
  local n=$1 kind=$2 label=$3 step=$4 ttl=$5 exp
  exp=$(date -u -d "+$ttl" +%Y-%m-%dT%H:%M:%SZ)
  gh "$kind" edit "$n" --add-label "$label" >/dev/null
  gh "$kind" comment "$n" --body "Claimed by $step run $RUN_ID until $exp.
<!-- agent:lease step=$step run=$RUN_ID expires=$exp -->" >/dev/null
}

# renew <number> <issue|pr> <step> <ttl>   (post a newer marker; newest wins)
renew() {
  local n=$1 kind=$2 step=$3 ttl=$4 exp
  exp=$(date -u -d "+$ttl" +%Y-%m-%dT%H:%M:%SZ)
  gh "$kind" comment "$n" --body "Lease renewed by $step run $RUN_ID until $exp.
<!-- agent:lease step=$step run=$RUN_ID expires=$exp -->" >/dev/null
}

# release <number> <issue|pr> <label>   (call on success AND failure)
release() { gh "$2" edit "$1" --remove-label "$3" >/dev/null; }

# ---- Markers ------------------------------------------------------------
# markers <number> -> every agent marker found in the item's comments, in order
markers() {
  gh api "repos/{owner}/{repo}/issues/$1/comments" --paginate \
    --jq '.[] | .body | scan("<!-- agent:[^>]*-->")'
}

# review_rounds <pr>        -> number of Reviewing runs that did not merge
review_rounds() { markers "$1" | grep -c 'agent:handoff kind=review' || true; }

# shepherd_attempts <pr>    -> Shepherding fix attempts since the last handoff of any kind
shepherd_attempts() {
  markers "$1" | awk '/agent:handoff/{c=0} /agent:attempt step=shepherding/{c++} END{print c+0}'
}

# open_findings <pr>  -> number of review findings still open (0 if none).
# The newest event decides: a review handoff sets it to its open=N (1 if absent);
# a ready handoff or a Shepherding attempt after it resets it to 0.
open_findings() {
  markers "$1" | awk '
    /agent:handoff kind=review/ { if (match($0,/open=[0-9]+/)) o=substr($0,RSTART+5,RLENGTH-5)+0; else o=1 }
    /agent:handoff kind=ready/  { o=0 }
    /agent:attempt step=shepherding/ { o=0 }
    END { print o+0 }'
}

# ready_sha <pr>  -> head SHA recorded by the newest `kind=ready` handoff (empty if none)
ready_sha() {
  markers "$1" | grep 'agent:handoff kind=ready' | tail -n1 | sed -n 's/.*sha=\([0-9a-f]*\).*/\1/p'
}

# ---- Issue <-> PR links -------------------------------------------------
# A PR "belongs to" issue N if ANY of these is true (several signals, because
# GitHub's own "closing reference" only works for PRs aimed at the default branch):
#   1. its body has the hidden marker  <!-- agent:implements issue=N -->
#   2. its branch is  <type>/N-<topic>
#   3. its body says  Closes|Fixes|Resolves #N

# prs_for_issue <issue>  -> one line per PR: "<number> <OPEN|MERGED|CLOSED>" (newest 200 PRs, all states)
prs_for_issue() {
  gh pr list --state all --limit 200 --json number,state,body,headRefName \
  | jq -r --arg n "$1" '.[]
      | select( ((.body // "") | contains("<!-- agent:implements issue=" + $n + " -->"))
             or (.headRefName | test("^[a-z]+/" + $n + "-"))
             or ((.body // "") | test("(?i)(closes|fixes|resolves)\\s+#" + $n + "\\b")) )
      | "\(.number) \(.state)"'
}

# issue_for_pr <pr>  -> issue numbers this PR implements (marker, Closes/Fixes/Resolves text, or GitHub closing reference), one per line
issue_for_pr() {
  gh pr view "$1" --json body,closingIssuesReferences --jq '
    ([ (.body // "") | scan("agent:implements issue=([0-9]+)") | .[0] ]
     + [ (.body // "") | scan("(?i)(?:closes|fixes|resolves)\\s+#([0-9]+)") | .[0] ]
     + [ .closingIssuesReferences[].number | tostring ]) | unique | .[]'
}

# ---- Run log ------------------------------------------------------------
# log_issue -> prints the number of this month's log issue (creates it if missing)
log_issue() {
  local title n
  title="Agent log $(date -u +%Y-%m)"
  n=$(gh issue list --label agent:log --state open --search "\"$title\" in:title" \
        --json number --jq 'sort_by(.number) | .[0].number // empty')
  if [ -z "$n" ]; then
    n=$(gh issue create --title "$title" --label agent:log \
          --body "Append-only run log: one comment per run. Excluded from every workflow step. Do not close during the month." \
        | grep -o '[0-9]*$')
  fi
  echo "$n"
}

# log_run <body-file>  -> append the file as one comment on the log issue
log_run() { gh issue comment "$(log_issue)" --body-file "$1" >/dev/null; }

# read_logs <days>  -> bodies of log comments newer than <days> days
read_logs() {
  local cutoff n
  cutoff=$(date -u -d "-$1 days" +%Y-%m-%dT%H:%M:%SZ)
  for n in $(gh issue list --label agent:log --state all --limit 3 --json number --jq '.[].number'); do
    gh issue view "$n" --json comments \
      --jq ".comments[] | select(.createdAt > \"$cutoff\") | \"---\n\" + .body"
  done
}
