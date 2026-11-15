#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT="/workspace/app"
cd "$REPO_ROOT"
source "$REPO_ROOT/.agents/skills/agent-workflow-protocol/scripts/lib.sh"

echo "---stale_triage---"
gh issue list --state open --label agent:triage --limit 200 --json number --jq -r '.[].number' 2>&1 | sed 's/^/T:/'
echo "---stale_inprog---"
gh issue list --state open --label agent:in-progress --limit 200 --json number --jq -r '.[].number' 2>&1 | sed 's/^/I:/'