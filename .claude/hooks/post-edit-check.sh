#!/usr/bin/env bash
# PostToolUse hook: (1) block hard-coded Anthropic keys, (2) format files with Prettier.
input="$(cat)"
path="$(printf '%s' "$input" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*:[[:space:]]*"\(.*\)"/\1/')"

[ -f "$path" ] || exit 0

if grep -q 'sk-ant-' "$path" 2>/dev/null; then
  echo "Blocked: $path contains what looks like an Anthropic API key. Remove it and use process.env.ANTHROPIC_API_KEY." >&2
  exit 2
fi

case "$path" in
  *.ts|*.tsx|*.css|*.json|*.md)
    if [ -x "$CLAUDE_PROJECT_DIR/node_modules/.bin/prettier" ]; then
      "$CLAUDE_PROJECT_DIR/node_modules/.bin/prettier" --write "$path" >/dev/null 2>&1 || true
    fi
    ;;
esac
exit 0
