#!/usr/bin/env bash
# Shared helpers for the GitHub agent workflow (see ../SKILL.md).
# Usage: source <this skill's directory>/scripts/lib.sh   (run from inside the target repository)
# Requires: gh (authenticated), jq, and Node.js for portable date arithmetic.
#
# There is no config file. Every default this library needs is set here, by name, and the same
# names are the keys a run may override: pass them as key=value pairs on a line of their own, or
# export them first. Whatever the run does not set falls back to the default below, exactly as
# ../SKILL.md's Defaults table describes.

AGENT_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_ROOT="$(git rev-parse --show-toplevel)"

# ---- Defaults ---------------------------------------------------------------
: "${app_url:=}"
: "${issues_per_run:=5}"
: "${log_lookback_days:=14}"
: "${dedupe_closed_days:=30}"
: "${pr_base_branch:=main}"
: "${merge_method:=squash}"
: "${human_reviewer:=}"
: "${build_cmd:=}"
: "${git_hooks_path:=}"
: "${repo_guidance:=AGENTS.md}"
: "${lease_ttl_triage:=1 hour}"
: "${lease_ttl_implement:=3 hours}"
: "${lease_ttl_pr:=1 hour}"
: "${triage_batch:=5}"
: "${implement_batch:=1}"
: "${shepherd_batch:=3}"
: "${review_batch:=3}"
: "${max_shepherd_attempts:=3}"
: "${max_review_rounds:=3}"
: "${max_item_failures:=3}"

if [ -n "${AGENT_OVERRIDES:-}" ] && [ -f "${AGENT_OVERRIDES}" ]; then
  # shellcheck disable=SC1090
  source "${AGENT_OVERRIDES}"
fi

_config_pairs="
app_url:APP_URL
issues_per_run:ISSUES_PER_RUN
log_lookback_days:LOG_LOOKBACK_DAYS
dedupe_closed_days:DEDUPE_CLOSED_DAYS
pr_base_branch:PR_BASE_BRANCH
merge_method:MERGE_METHOD
human_reviewer:HUMAN_REVIEWER
build_cmd:BUILD_CMD
git_hooks_path:GIT_HOOKS_PATH
repo_guidance:REPO_GUIDANCE
lease_ttl_triage:LEASE_TTL_TRIAGE
lease_ttl_implement:LEASE_TTL_IMPLEMENT
lease_ttl_pr:LEASE_TTL_PR
triage_batch:TRIAGE_BATCH
implement_batch:IMPLEMENT_BATCH
shepherd_batch:SHEPHERD_BATCH
review_batch:REVIEW_BATCH
max_shepherd_attempts:MAX_SHEPHERD_ATTEMPTS
max_review_rounds:MAX_REVIEW_ROUNDS
max_item_failures:MAX_ITEM_FAILURES
"
while IFS=: read -r _lower _upper; do
  [ -n "$_lower" ] || continue
  eval "export $_upper=\${$_lower}"
done <<CONFIG_PAIRS
$_config_pairs
CONFIG_PAIRS
unset _config_pairs _lower _upper

# Portable date helpers via Node.js (no Python dependency). The single
# implementation lives in `helpers.mjs` next to this file; the shell and that
# file cannot disagree about dates, run ids or comment shapes.

# Path to the shared Node implementation. lib.sh runs its CLI so the shell and
# helpers.mjs stay in sync.
HELPERS="$AGENT_LIB_DIR/helpers.mjs"

utc_epoch() {
  node "$HELPERS" utc-epoch "$1"
}

utc_plus() {
  node "$HELPERS" utc-plus "$1"
}

RUN_ID="${RUN_ID:-$(node "$HELPERS" run-id "${RUNNER:-$$}")}"
export RUN_ID

has_label() { gh "$2" view "$1" --json labels --jq '.labels[].name' | grep -qx -- "$3"; }

lease_live() {
  local exp now
  exp=$(gh api "repos/{owner}/{repo}/issues/$1/comments" --paginate \
        --jq '.[] | .body | capture("<!-- agent:lease [^>]*expires=(?<e>[0-9TZ:-]+)") | .e' \
        | tail -n1)
  now=$(date -u +%s)
  [ -n "$exp" ] && [ "$now" -lt "$(utc_epoch "$exp")" ]
}

claim() {
  local n=$1 kind=$2 label=$3 step=$4 ttl=$5 exp
  exp=$(utc_plus "+$ttl")
  gh "$kind" edit "$n" --add-label "$label" >/dev/null
  gh "$kind" comment "$n" --body "$(node "$HELPERS" lease-body "$step" "$RUN_ID" "$exp")" >/dev/null
}

renew() {
  local n=$1 kind=$2 step=$3 ttl=$4 exp
  exp=$(utc_plus "+$ttl")
  gh "$kind" comment "$n" --body "$(node "$HELPERS" lease-body "$step" "$RUN_ID" "$exp" renew)" >/dev/null
}

release() { gh "$2" edit "$1" --remove-label "$3" >/dev/null; }

markers() {
  gh api "repos/{owner}/{repo}/issues/$1/comments" --paginate \
    --jq '.[] | .body | scan("<!-- agent:[^>]*-->")'
}

review_rounds() { markers "$1" | grep -c 'agent:handoff kind=review' || true; }

shepherd_attempts() {
  markers "$1" | awk '/agent:handoff/{c=0} /agent:attempt step=shepherding/{c++} END{print c+0}'
}

fail_item() {
  local n=$1 kind=$2 step=$3 reason=$4
  gh "$kind" comment "$n" --body "$(node "$HELPERS" failure-body "$step" "$RUN_ID" "$reason")" >/dev/null
}

# Count failure markers for a step since the last escalate. When the step is
# Triaging, also count legacy "Grooming" markers (see helpers.mjs LEGACY_STEP_NAMES).
failures() {
  markers "$1" | awk -v s="$2" '
    BEGIN {
      if (s == "Triaging") legacy = "Grooming"
      else legacy = ""
    }
    /agent:escalate/ { c = 0 }
    index($0, "agent:failure step=" s " ") { c++ }
    legacy != "" && index($0, "agent:failure step=" legacy " ") { c++ }
    END { print c+0 }
  '
}

open_findings() {
  markers "$1" | awk '
    /agent:handoff kind=review/ { if (match($0,/open=[0-9]+/)) o=substr($0,RSTART+5,RLENGTH-5)+0; else o=1 }
    /agent:handoff kind=ready/  { o=0 }
    /agent:attempt step=shepherding/ { o=0 }
    END { print o+0 }'
}

ready_sha() {
  markers "$1" | grep 'agent:handoff kind=ready' | tail -n1 | sed -n 's/.*sha=\([0-9a-f]*\).*/\1/p'
}

prs_for_issue() {
  gh pr list --state all --limit 200 --json number,state,body,headRefName \
  | jq -r --arg n "$1" '.[]
      | select( ((.body // "") | contains("<!-- agent:implements issue=" + $n + " -->"))
             or (.headRefName | test("^[a-z]+/" + $n + "-"))
             or ((.body // "") | test("(?i)(closes|fixes|resolves)\\s+#" + $n + "\\b")) )
      | "\(.number) \(.state)"'
}

issue_for_pr() {
  gh pr view "$1" --json body,closingIssuesReferences --jq '
    ([ (.body // "") | scan("agent:implements issue=([0-9]+)") | .[0] ]
     + [ (.body // "") | scan("(?i)(?:closes|fixes|resolves)\\s+#([0-9]+)") | .[0] ]
     + [ .closingIssuesReferences[].number | tostring ]) | unique | .[]'
}

log_issue() {
  local title n cutoff
  cutoff=$(utc_plus "-14 days")
  n=$(gh issue list --label agent:log --state open --limit 5 --json number,createdAt \
        --jq --arg c "$cutoff" '[.[] | select(.createdAt >= $c)] | sort_by(.number) | .[0].number // empty')
  if [ -z "$n" ]; then
    title="Agent log $(date -u +%Y-%m-%d)"
    n=$(gh issue create --title "$title" --label agent:log \
          --body "Append-only run log: one comment per run. Covers roughly two weeks. Excluded from every workflow step." \
        | grep -o '[0-9]*$')
  fi
  echo "$n"
}

log_run() {
  local file=$1 body step diff_n
  gh issue comment "$(log_issue)" --body-file "$file" >/dev/null
  body=$(cat "$file")
  echo "$body" | grep -q '\*\*Problems:\*\*' || return 0
  echo "$body" | awk '/\*\*Problems:\*\*/{p=$0; sub(/.*\*\*Problems:\*\*[[:space:]]*/,"",p); if(length(p)==0) exit 1}' || return 0
  step=$(echo "$body" | sed -n 's/.*\*\*Step:\*\*[[:space:]]*\([^[:space:]]*\).*/\1/p' | head -1)
  if [ -z "$step" ]; then
    step=$(echo "$body" | awk '/^```ya?ml$/{f=1;next} /^```$/{f=0} f && /^step:/{sub(/^step:[[:space:]]*/,""); print; exit}')
  fi
  [ -n "$step" ] || return 0
  diff_n=$(difficulty_issue "$step")
  [ -n "$diff_n" ] || return 0
  gh issue comment "$diff_n" --body-file "$file" >/dev/null
}

difficulty_issue() {
  local step=$1 title n
  title="Agent difficulties: $step"
  n=$(gh issue list --label agent:difficulty --state open --search "\"$title\" in:title" \
        --json number,title --jq --arg t "$title" '.[] | select(.title==$t) | .number' | head -1)
  if [ -z "$n" ]; then
    n=$(gh issue create --title "$title" --label agent:difficulty \
          --body "Difficulties encountered by the $step step. One comment per run that reported **Problems**. Rotate on a ~2 week cadence like the run log." \
        | grep -o '[0-9]*$')
  fi
  echo "$n"
}

read_logs() {
  local cutoff n
  cutoff=$(utc_plus "-$1 days")
  for n in $(gh issue list --label agent:log --state all --limit 3 --json number --jq '.[].number'); do
    gh issue view "$n" --json comments \
      --jq ".comments[] | select(.createdAt > \"$cutoff\")
            | select((.body | contains(\"Outcome:** nothing eligible\") and (contains(\"**Problems:**\") | not)) | not)
            | \"---\n\" + .body"
  done
}
