# Pull request format

How to write a pull request body in this repository. For the broader scope,
verify and finish flow, see [the agent workflow](./AGENT-WORKFLOW.md).

## Closing issues

When a PR resolves one or more issues, GitHub only auto-links the first issue in
a single sentence. Use one `Closes` statement per issue, each on its own line.

**Correct:**

```
- Closes #122.
- Closes #123.
- Closes #124.
- Closes #125.
```

**Also correct** (when the PR does not close them):

```
- Related to #122.
- Related to #123.
```

**Incorrect** (only closes #122):

```
Closes #122, #123, #124, #125
```

## Merge target

Ship every change, Template changes included, in a pull request into `develop`
from a gitflow branch. Never push straight to `main` or `develop`. See [branch
names](./BRANCH-NAMES.md) for the allowed names and enforcement.