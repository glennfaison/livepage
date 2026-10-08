# Grooming Workflow

The goal is to groom the issue, making it ready for an agent to implement.

## Process

1. **Tag the issue** as `agent:grooming` when starting work on it.

2. **Check for stale grooming**: If an issue has had the `agent:grooming` tag for more than 1 hour, assume it is not currently being groomed and can be picked up.

3. **Find duplicates**: Search for duplicate issues and merge them into new issues, closing the pre-existing duplicates.

4. **Link related issues**: Find any related issues and link them in the issue description or comments.

5. **Triage review**: Review the issue and associated comments with a triage skill, leaving findings in the comments.

6. **Grilling for clarity**: Use a grilling skill to leave comments that include any questions required to come to a mutual understanding with the code owners. Tag the issue as `needs-info` when questions are outstanding.

7. **Update issue description**: Update the Issue description as necessary during this process, as well as adding comments using a handoff skill.

8. **Resolve comments**: Close/resolve comments whose questions are already answered.

9. **Mark readiness**: 
   - If an issue is ready for implementation and an agent can get all the necessary context to implement between the issue and the codebase, mark the issue as `ready-for-agent`
   - If a human is needed, mark as `ready-for-human`

10. **Cleanup**: When done with an issue, remove the `agent:grooming` tag.

## References

- Related to Issue #122
- Supplements: Implementing.md, Reviewing.md, Exploring.md