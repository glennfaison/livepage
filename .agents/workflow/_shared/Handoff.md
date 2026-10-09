# Handoff comments

The `/handoff` skill compacts a conversation into a document for another agent and saves it to the OS temp directory. In this workflow a handoff is a **comment**, so:

- Follow the skill's rules: write for a fresh agent with none of your context, reference artifacts (PR, issue, commit, check run) by link instead of copying them, and redact secrets and personal data.
- Compose it in a file in the OS temp directory, then post it with `gh pr comment N --body-file FILE`. **Never write it into the repository.**
- End the comment with the marker the step requires (see `_shared/Protocol.md`).

## Contents by author

| Author | Comment | Required content |
|---|---|---|
| Shepherding | the "ready" handoff on a PR | **Changes** made, **Decisions** taken and why, **Risks**, **Verification** actually run (commands and results), **Reviewer focus** (where to look hardest) |
| Reviewing | the "review" handoff on a PR | **Verdict**, **Findings**: each with what is wrong, why, and whether it is fixed (with the commit) or still open; **What remains**; **Verification** you ran |

## Issues

Issues do not use `/handoff`. For an issue, the comment `/triage` writes is the handoff: an **Agent Brief** for `ready-for-agent`, the same structure plus why it cannot be delegated for `ready-for-human`, or **Triage Notes** for `needs-info`. A conversation summary on top would only duplicate it.
