---
name: pipeline-guide
description: Table of contents for the GitHub agent workflow package. Lists every skill, what it is for, and when to run it. Start here.
---

# Pipeline guide

Map of the GitHub issue-to-merge agent workflow. Read this first; then open the skill you need.

## Meta

| Skill | Purpose |
| --- | --- |
| `agent-workflow-protocol` | Shared rules (leases, markers, labels, handoffs, trust, run log). Every other skill reads it. |
| `setup-github-agent-workflow` | One-time repository setup (labels, settings). User-invoked. |
| `runner-prompts` | Copy-paste prompts for scheduled runners. |
| `pipeline-guide` | This file. |

## Pipeline steps

| Step | Group skill | Item skill |
| --- | --- | --- |
| Explore | `explore-github-repo` | `file-github-issues` |
| Triage | `triage-github-issues` | `triage-github-issue` |
| Implement | `implement-github-issues` | `implement-github-issue` |
| Shepherd | `shepherd-github-prs` | `shepherd-github-pr` |
| Review | `review-github-prs` | `review-github-pr` |

## Utility

| Skill | Purpose |
| --- | --- |
| `grill-via-github-comments` | Ask clarifying questions via issue/PR comments. |
| `unattended-triage` | Triage helpers for unattended runs. |
| `merge-safety` | Gate merging when safe. |
