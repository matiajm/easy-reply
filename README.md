# EasyReply

Dashboard that summarizes student emails for a professor and drafts replies from one decision. Human approval on every reply.

## Quick start

```bash
npm install
cp .env.example .env.local     # keep MOCK_AI=true and MOCK_GRAPH=true to start
npm run dev                    # http://localhost:3000
npm test
```

## Open in Cursor with Claude Code

1. Unzip, then `File > Open Folder` in Cursor.
2. Open the terminal and run `claude` (install: https://docs.claude.com/en/docs/claude-code).
3. Claude reads `CLAUDE.md` automatically. Run `/init` only if you want to regenerate it (not needed).
4. Start with `docs/TEAM_PLAN.md`, find your name, and do step 1.

## Docs
- `docs/PRD.md` product requirements
- `docs/TEAM_PLAN.md` step-by-step tasks per person
- `docs/EDGE_CASES.md` email edge cases and expected behavior
- `docs/CLAUDE_FEATURES.md` how we use skills, subagents, hooks, MCP
