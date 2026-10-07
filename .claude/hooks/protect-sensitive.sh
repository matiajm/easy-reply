#!/usr/bin/env bash
# PreToolUse hook: stop edits to secrets and lockfiles. Exit code 2 blocks the tool and shows stderr to Claude.
input="$(cat)"
path="$(printf '%s' "$input" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*:[[:space:]]*"\(.*\)"/\1/')"

case "$path" in
  *.env|*.env.local|*.env.*.local|*/package-lock.json)
    echo "Blocked: $path is protected (secrets or lockfile). Edit .env.example instead, and ask a human to change real env files." >&2
    exit 2
    ;;
esac
exit 0
