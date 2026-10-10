# GitHub workflow: LivePage notes

LivePage uses the [github-agent-workflow-skills](../../.agents/skills/github-agent-workflow-skills/README.md)
package. Its repository settings are in [github-workflow.env](./github-workflow.env). The notes below are
one-time migration steps from the workflow's earlier label names and PR conventions. Run them once, then
this file can be deleted.

## One-time migration from the old names

```bash
gh label edit "agent-in-progress" --name "agent:in-progress"   # skip if agent:in-progress already exists
gh label edit "agent-stuck"       --name "agent:stuck"
```

Exploring no longer applies `needs-triage` or `agent-found`. Leave existing `agent-found` labels alone. An old `needs-triage` is harmless: Grooming treats it as untouched and removes it. Any issue still carrying the old `agent:triage` or `agent-in-progress` lease will be treated as unleased once its lease marker is missing or expired.

## One-time migration of in-flight work

PRs opened by the old workflow have no markers or state labels. Mark them now, so nothing starts a second PR for an issue that already has one:

```bash
source .agents/skills/github-workflow-protocol/scripts/lib.sh
for pr in $(gh pr list --state open --json number --jq '.[].number'); do
  for issue in $(issue_for_pr "$pr"); do
    gh issue edit "$issue" --remove-label ready-for-agent --add-label agent:pr-open
    gh pr edit "$pr" --add-label agent:needs-work     # Shepherding will sort out its real state
  done
done
```
