# Using Claude Code features in this project

This repo is set up so you can practice each feature from the bootcamp on real work. Everything lives under `.claude/` (except `CLAUDE.md` and `.mcp.json` at the root) and is shared through git.

| Feature | Where | What it does here | Who uses it most |
|---|---|---|---|
| **CLAUDE.md** | `CLAUDE.md` | Claude reads it every session: stack, commands, the 7 non-negotiable rules | Everyone |
| **Hooks** | `.claude/settings.json`, `.claude/hooks/` | Automatic guardrails that run on tool use | Lucas |
| **Subagents** | `.claude/agents/` | Specialist reviewers with their own context | Everyone |
| **Skills** | `.claude/skills/` | Reusable playbooks Claude loads when relevant | Matias, Lucas |
| **Slash commands** | `.claude/commands/` | Shortcuts you type: `/new-category`, `/review-pr` | Everyone |
| **MCP servers** | `.mcp.json` | Connect Claude to tools: current docs, a real browser | Valery, Diego |
| **Permissions** | `.claude/settings.json` | Allow safe commands, deny reading `.env` | Lucas |

## 1. Hooks (guardrails that always run)
Hooks are shell commands Claude Code runs automatically. Ours:
- **PreToolUse, `protect-sensitive.sh`:** blocks any edit to `.env`, `.env.local`, and `package-lock.json`. Exit code 2 stops the action and tells Claude why.
- **PostToolUse, `post-edit-check.sh`:** after Claude edits a `.ts/.tsx` file it (a) runs Prettier and (b) blocks the edit if it contains something that looks like an Anthropic key (`sk-ant-`).
- **Idea to add (Lucas):** a `Stop` hook that runs `npm run typecheck && npm test` and tells Claude to fix failures before it says it is done.
- **Idea to add:** a `PreToolUse` hook on `Bash` that blocks `git push --force` and `git push origin main`.

Try it: ask Claude "add my key to .env.local". It should be blocked.

## 2. Subagents (specialists with a fresh context)
Defined as markdown files with a prompt and allowed tools. Claude delegates to them automatically, or you say "use the ferpa-reviewer subagent on my changes".
- `ferpa-reviewer`: checks diffs against the privacy and safety rules. Lucas runs it on every PR.
- `test-writer`: writes Vitest tests for rules and edge cases.
- `prompt-evaluator`: Matias uses it to read eval failures and propose prompt fixes.
- `design-reviewer`: Valery uses it to review components for accessibility, tokens, and responsive layout.

Practice: have Claude run two subagents in parallel ("review this PR with ferpa-reviewer and design-reviewer at the same time").

## 3. Skills (playbooks Claude loads on demand)
A skill is a folder with `SKILL.md`. Claude reads the description and loads the skill only when the task matches.
- `triage-email`: the checklist for classifying a student email and extracting facts. Matias improves it as evals reveal gaps.
- `add-policy-rule`: step-by-step for adding or changing a professor rule safely (rule, test, edge case row, docs).

Practice: ask "the professor now allows 5 days for the first extension" and watch Claude use `add-policy-rule`.
Stretch: use the skill-creator to make a `draft-reply` skill with the professor's tone examples.

## 4. Slash commands
- `/new-category <name>`: walks through adding a new email category in the right order (type, prompt, rules, drafts, UI, test).
- `/review-pr`: runs both reviewer subagents on the current diff and summarizes.

## 5. MCP (Model Context Protocol)
`.mcp.json` registers:
- **Context7:** gives Claude up-to-date docs for Next.js, Tailwind, the Anthropic SDK, and Microsoft Graph libraries. Add "use context7" to prompts when an API is new to you.
- **Playwright:** lets Claude open `localhost:3000` in a browser, click, and take screenshots. Valery uses it for visual checks.

Ideas for later:
- **GitHub MCP** (`claude mcp add`): Claude opens PRs and reads issues.
- **A custom `mdc-policy` MCP server** (stretch, Matias + Diego): exposes `get_policy()` and `check_request(facts)` so any agent can ask the rules engine. This is also how the grading agent in phase 2 could read the professor's rubric.
- **Microsoft 365 / Outlook MCP:** useful for exploring a mailbox during development. Do not point it at real student mail without the professor's consent.

## 6. Agents for phase 2 (grading)
When we get to grading: one orchestrating agent reads the assignment and rubric; a subagent per criterion scores with evidence; a "skeptic" subagent challenges borderline scores; the professor reviews low-confidence items only. Build it with the Claude Agent SDK in TypeScript. Do not start before the email MVP works.

## 7. Good habits
- Start sessions with the step you are on: "I am Valery, doing V3. Read docs/TEAM_PLAN.md."
- Ask Claude to plan before coding on anything bigger than one file (Shift+Tab for plan mode).
- Commit small. Use `/clear` when switching tasks so context stays clean.
- Keep `CLAUDE.md` short and true. If Claude keeps making the same mistake, add a line there.
- Review what Claude writes. You are responsible for the PR.
