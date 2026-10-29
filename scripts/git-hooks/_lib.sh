# Shared by the hooks in this directory. Sourced, never executed directly.

# Every hook runs a Node script. Fail with a message that says what to do,
# instead of the bare "node: not found" from the shell.
require_node() {
  if ! command -v node >/dev/null 2>&1; then
    echo "git hook: 'node' is not on PATH (Node.js 18.18+ is required)." >&2
    echo "If you use nvm, fnm, or volta, run git from a shell where node works." >&2
    exit 1
  fi
}
