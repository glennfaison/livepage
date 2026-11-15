#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT="/workspace/app"
cd "$REPO_ROOT"
source "$REPO_ROOT/.agents/skills/agent-workflow-protocol/scripts/lib.sh"

# stale triage
while IFS= read -r n; do
  [ -z "$n" ] && continue
  if lease_live "$n" >/dev/null 2>&1; then
    echo "LIVE_T:$n"
  else
    echo "CLEAR_T:$n"
    clear_stale_lease "$n" issue >/dev/null 2>&1 || true
  fi
done < <(gh issue list --state open --label agent:triage --limit 200 --json number --jq -r '.[].number')

# stale in-progress
while IFS= read -r n; do
  [ -z "$n" ] && continue
  if lease_live "$n" >/dev/null 2>&1; then
    echo "LIVE_I:$n"
  else
    echo "CLEAR_I:$n"
    clear_stale_lease "$n" issue >/dev/null 2>&1 || true
  fi
done < <(gh issue list --state open --label agent:in-progress --limit 200 --json number --jq -r '.[].number')