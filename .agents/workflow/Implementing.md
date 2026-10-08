# Implementing Workflow

The goal is to implement the goal of the issue.

## Process

1. **Pick up the issue**: When you pick up an issue, remove the `ready-for-agent` tag and set an `agent:in-progress` tag.

2. **Read context**: Read through the issue, its open comments, the associated ADRs, and relevant code.

3. **Implement**: Call `/implement-spec` or some other implementation skill to deliver the deliverable.

4. **Open PR**: When done with the implementation, remove the `agent:in-progress` tag from the issue and open a PR linking the issue.

5. **Monitor PR**: Watch the PR as it goes through the checks and fix any issues that pop up.

6. **Mark for review**: When the PR is ready for review and passes all checks, tag it `ready-for-review` and remove the `ready-for-agent` tag.

## References

- Related to Issue #123
- Supplements: Grooming.md, Reviewing.md, Exploring.md