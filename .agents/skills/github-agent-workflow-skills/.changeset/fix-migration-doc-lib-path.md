---
"github-agent-workflow-skills": patch
---

Fix the `lib.sh` source path in `docs/agents/github-workflow-migration.md` so the
one-time migration script points at the packaged protocol skill instead of the
old flat `.agents/skills/github-workflow-protocol/` path that no longer exists.