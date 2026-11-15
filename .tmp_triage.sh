#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT="/workspace/app"
source "$REPO_ROOT/.agents/skills/agent-workflow-protocol/scripts/lib.sh"
# Step 1
stale_triage=$(gh issue list --state open --label agent:triage --limit 200 --json number --jq '.[].number')
stale_inprog=$(gh issue list --state open --label agent:in-progress --limit 200 --json number --jq '.[].number')
echo "TRIAGE:$stale_triage"
echo "INPROG:$stale_inprog"