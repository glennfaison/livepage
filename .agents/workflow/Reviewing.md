# Reviewing Workflow

The goal is to review a PR and determine if it can be merged by an agent.

## Process

1. **Review the PR**: Use a merge-safety skill and a code review skill. Read the PR title, body, and even comments.

2. **Leave notes if not ready**: If the PR is not ready to be merged, leave notes in the comments using a handoff skill.

3. **Merge if approved**: If the PR has passed all checks and is judged as mergeable by an agent, merge it.

4. **Otherwise, comment**: If not mergeable, leave a comment with the handoff skill explaining what needs to be fixed.

5. **Attempt to fix**: If the PR cannot be merged after your review, try to fix it.

6. **Escalate if needed**: If you are unable to fix it, tag it `ready-for-agent` or `ready-for-human` depending on whether it needs to be resolved by a human or agent.

7. **Prevent overlapping reviews**: Use per-PR concurrency so only one review or fix attempt runs at a time.

## References

- Related to Issue #124
- Supplements: Grooming.md, Implementing.md, Exploring.md
- Uses: merge-safety skill, code-review skill