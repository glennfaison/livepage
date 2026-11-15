#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT="/workspace/app"
cd "$REPO_ROOT"
source "$REPO_ROOT/.agents/skills/agent-workflow-protocol/scripts/lib.sh"

echo "---stale_triage---"
gh issue list --state open --label agent:triage --limit 200 --json number --jq -r '.[].number' | while read -r n; do
  if ! lease_live "$n" >/dev/null 2>&1; then
    echo "CLEAR_T:$n"
    clear_stale_lease "$n" issue || true
  fi
done
echo "---stale_inprog---"
gh issue list --state open --label agent:in-progress --limit 200 --json number --jq -r '.[].number' | while read -r n; do
  if ! lease_live "$n" >/dev/null 2>&1; then
    echo "CLEAR_I:$n"
    clear_stale_lease "$n" issue || true
  fi
done