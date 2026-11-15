#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT="/workspace/app"
cd "$REPO_ROOT"
source "$REPO_ROOT/.agents/skills/agent-workflow-protocol/scripts/lib.sh"

echo "--- stale agent:triage ---"
triage_nums=$(gh issue list --state open --label agent:triage --limit 200 --json number --jq '.[].number' | tr -d '\n\r ')
echo "$triage_nums"
echo "--- stale agent:in-progress ---"
inprog_nums=$(gh issue list --state open --label agent:in-progress --limit 200 --json number --jq '.[].number' | tr -d '\n\r ')
echo "$inprog_nums"