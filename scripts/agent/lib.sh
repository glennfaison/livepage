#!/usr/bin/env bash
# Shared helpers for agent workflow steps. Source this file; do not execute it.
# See .agents/workflow/_shared/Protocol.md and config.env.

set -euo pipefail

# Load config if present
if [[ -f .agents/workflow/_shared/config.env ]]; then
  # shellcheck disable=SC1091
  source .agents/workflow/_shared/config.env
fi

: "${PR_BASE_BRANCH:=develop}"
: "${LEASE_TTL_TRIAGE:=2h}"
: "${LEASE_TTL_IMPLEMENT:=3h}"
: "${GROOM_BATCH:=5}"
: "${IMPLEMENT_BATCH:=1}"
: "${EXPLORE_ISSUE_CAP:=5}"
: "${EXPLORE_LOG_LOOKBACK_DAYS:=30}"
: "${EXPLORE_BASE_URL:=}"

claim() {
  local n="$1" kind="$2" label="$3" step="$4" ttl="$5"
  echo "claim $n $kind $label $step $ttl"
}

release() {
  local n="$1" kind="$2" label="$3"
  echo "release $n $kind $label"
}

lease_live() {
  local n="$1"
  return 1
}

prs_for_issue() {
  local n="$1"
  gh pr list --state all --search "Closes #$n OR Fixes #$n OR Resolves #$n" --json number,state,title,headRefName 2>/dev/null || true
}

read_logs() {
  local days="$1"
  echo "read_logs $days"
}
