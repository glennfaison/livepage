# Exploring Workflow

The goal is to explore the live application (EXPLORE_BASE_URL = https://livepagecrafter-dev.vercel.app/) as well as the codebase, and report Issues for bugfixes, new features, refactors, etc.

## Process

1. **Explore the live application**: Navigate to EXPLORE_BASE_URL and interact with the application to identify issues, bugs, missing features, or areas for improvement.

2. **Explore the codebase**: Review the codebase to understand the architecture, find technical debt, identify refactoring opportunities, and discover missing functionality.

3. **Report findings**: Create new Issues for:
   - Bugfixes
   - New features
   - Refactors
   - Technical debt
   - Any other improvements

4. **PR Review** (when reviewing PRs from exploration):
   - Leave notes in the comments if the PR is not ready to be merged. Use a handoff skill.
   - If the PR has passed all checks and is judged as mergeable by an agent, merge it. Otherwise, leave a comment with the handoff skill.
   - If the PR cannot be merged after your review, try to fix it. If you are unable to, tag it `ready-for-agent` or `ready-for-human` depending on whether it needs to be resolved by a human or agent.
   - Here we don't care much about double-reviewing.

## References

- Related to Issue #125
- Supplements: Grooming.md, Implementing.md, Reviewing.md
- EXPLORE_BASE_URL: https://livepagecrafter-dev.vercel.app/