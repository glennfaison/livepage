#!/bin/bash
cd /workspace/app
source .agents/skills/agent-workflow-protocol/scripts/lib.sh
echo "---BEGIN---"
# stale triage
for n in $(gh issue list --state open --label agent:triage --limit 200 --json number --jq -r '.[].number'); do
  if lease_live "$n" >/dev/null 2>&1; then echo "LIVE_T:$n"; else echo "CLEAR_T:$n"; clear_stale_lease "$n" issue >/dev/null 2>&1 || true; fi
done
# stale in-progress
for n in $(gh issue list --state open --label agent:in-progress --limit 200 --json number --jq -r '.[].number'); do
  if lease_live "$n" >/dev/null 2>&1; then echo "LIVE_I:$n"; else echo "CLEAR_I:$n"; clear_stale_lease "$n" issue >/dev/null 2>&1 || true; fi
done
echo "---END---"