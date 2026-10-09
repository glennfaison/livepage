# Exploring

Explore the live app and the codebase, then file the most valuable findings as issues. Exploring applies **no labels**: Grooming picks up unlabelled issues.

**Read first:** `_shared/Protocol.md`, `_shared/Dedupe.md`, `_shared/IssueFormat.md`, `_shared/Log.md`, `_shared/config.env`. Then `source scripts/agent/lib.sh`.

## Trigger

Scheduled. No guard and no lease: Exploring only reads, and the only thing it writes is new issues.

## Process

1. **Read the run log.** `read_logs "$EXPLORE_LOG_LOOKBACK_DAYS"`. Collect:
   - **Deferred candidates** left by earlier Exploring runs.
   - **Problems** that recur: repeated failures, escalations, flaky checks, items skipped again and again.
   - **Automation suggestions**.
   Each becomes a candidate in step 4.
2. **Explore the live app.** Open `$EXPLORE_BASE_URL` and use it as a user would. Look for bugs, rough edges and missing features.
3. **Explore the codebase.** Read for architecture problems, technical debt, refactor opportunities and missing functionality.
   - The live app and the code are read-only. Use test data only. Take no destructive action against the target.
4. **Build the candidate list. Do not cap it.** For each: a title, a category (`bugfix`, `feature`, `refactor`, `debt`), the evidence for that category (see `_shared/IssueFormat.md`), and the impact. **For a feature, write the use case before anything else:** who the user is, what they are trying to do, and why that falls short today. If you cannot state a use case, it is not a feature candidate: drop it or reword it as a question in the log. While exploring the live app, capture screenshots for bugs and for the screen where a feature would live.
5. **Dedupe every candidate** using `_shared/Dedupe.md`. A duplicate gets a comment on the existing issue with new evidence and is dropped from the list. These comments do not count toward the cap.
6. **Rank what is left and keep the top `$EXPLORE_ISSUE_CAP`.** Rank by severity times confidence first: user-facing breakage and data loss, backed by a reproduction, beat guesses. Break ties by value per effort.
7. **File the survivors.** `gh issue create --title … --body-file …` with **no `--label` flags** and no assignee. The body follows the category's tables in `_shared/IssueFormat.md`, plus a `Category:` line and a last line `Filed by Exploring run <RUN_ID>`. Attach screenshots if your runner can; otherwise fill **Visuals** with the "Not attached" note, as `_shared/IssueFormat.md` describes.
8. **Log it.** Follow `_shared/Log.md`. Include the issues filed, the comments added, the candidates dropped as duplicates, and **Deferred candidates** (the rest of the ranked list, one line each, at most 20).

## Never

- Apply, remove or change any label.
- File more than `$EXPLORE_ISSUE_CAP` issues in one run.
- Comment on, close or edit an issue other than to add evidence under step 5.
