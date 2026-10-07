---
description: Review the current branch with the privacy and design subagents, then summarize
---

1. Run `git diff main...HEAD --stat` to see what changed.
2. In parallel, run the `ferpa-reviewer` subagent on the diff, and the `design-reviewer` subagent if anything under `src/components` or `globals.css` changed.
3. Run `npm run typecheck && npm test`.
4. Summarize in this format: **Blockers**, **Warnings**, **Tests**, **Ready to merge? yes/no and why**. Keep it under 15 lines.
