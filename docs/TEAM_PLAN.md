# Team plan

Four people, four lanes. Everyone works in their own folder where possible so merges stay easy.

| Person | Role | Owns (folders/files) |
|---|---|---|
| **Lucas** | Tech lead, rules engine, integration, security | `src/lib/rules.ts`, `src/lib/types.ts`, `src/lib/inbox.ts`, `src/app/api/send/`, `CLAUDE.md`, `.claude/`, `docs/` |
| **Valery** | Design and front end | `src/components/`, `src/app/globals.css`, `src/app/page.tsx`, Figma |
| **Matias** | AI plugin: triage, drafts, agents, evals | `src/lib/ai/`, `src/lib/drafts.ts`, `evals/`, `.claude/agents/prompt-evaluator.md` |
| **Diego** | Backend: Microsoft email, database, auth, deploy | `src/lib/graph/`, `src/lib/store.ts`, `src/app/api/auth/`, `src/db/` |

Diego's lane was the open one. Backend plus Microsoft integration is the riskiest part of the project, so it has its own owner. If you would rather have Diego on testing/QA or DevOps, swap the D-steps below.

## Rules of the road
- Branch per task: `lucas/rules-v1`, `valery/queue-component`, and so on. Pull request into `main`. One reviewer, and Lucas merges.
- Shared contract = `src/lib/types.ts`. Change it only through a PR that mentions everyone.
- Run `npm run typecheck && npm test` before every PR.
- Daily 10-minute sync: what I did, what I'll do, what blocks me.
- Use Claude Code for your lane (see `docs/CLAUDE_FEATURES.md`). Tell it which step you are on.

## Phase 0: Setup (everyone, ~1 hour)
- [ ] **Lucas:** create a GitHub repo, push this project, protect `main` (require PR), invite the team.
- [ ] **All:** clone, open in Cursor, `npm install`, `cp .env.example .env.local`, `npm run dev`. You should see the dashboard with sample emails.
- [ ] **All:** start Claude Code (`claude`) in the project root. Ask: "Summarize this project from CLAUDE.md and tell me which files I own."
- [ ] **All:** read `docs/PRD.md` sections 1-9 and `docs/EDGE_CASES.md`.

## Lucas:  rules, integration
- [ ] **L1. Interview the professor** (30 min). Use the questions in PRD section 12. Fill real numbers into `POLICY` in `rules.ts`. *Done when:* the professor confirmed the rules in writing.
- [ ] **L2. Rules engine v1.** Cover every row of `docs/EDGE_CASES.md` with a test in `rules.test.ts`. Use the `/new-category` command and the `add-policy-rule` skill. *Done when:* tests pass for rows 1-16.
- [ ] **L3. API contract.** Lock the shapes in `types.ts`; write them in the PR so the other three can build against them. *Done when:* Valery, Matias, Diego each confirmed.
- [ ] **L4. Review gate.** For every PR, run the `ferpa-reviewer` subagent, then review by hand. Merge only if the 7 rules in `CLAUDE.md` still hold.
- [ ] **L5. Integration.** Wire real triage and real Graph into `inbox.ts`; handle failures (edge case 22). *Done when:* the app works with `MOCK_*=false` for one real test mailbox.
- [ ] **L6. Settings page (rules editor)** in coordination with Valery. *Done when:* the professor can change the extension limits without code.
- [ ] **L7. Pilot.** Run with the professor for a week; collect the metrics in the PRD. Write the grading PRD (phase 2) from what you learn.

## Valery: design and front end
- [ ] **V1. Design foundations.** Figma file with tokens (color, type, spacing), light and dark. Update `globals.css`. Choose fonts and load them with `next/font`. *Done when:* tokens in Figma match code.
- [ ] **V2. Wireframes.** Queue, email detail, outcome picker, reply editor, empty state, error state, mobile. Test with 1-2 classmates, then the professor. *Done when:* the professor can find "answer this email" in under 10 seconds.
- [ ] **V3. Split `Dashboard.tsx`** into `EmailList`, `EmailDetail`, `OutcomePicker`, `ReplyEditor`, `RiskBadge`. Keep the behavior. Use the `design-reviewer` subagent after each component.
- [ ] **V4. Accessibility pass.** Keyboard navigation (j/k to move, Enter to open, Cmd+Enter to send), focus states, contrast, screen reader labels.
- [ ] **V5. States.** Loading, empty inbox, AI failed ("Needs you" with a message), sent confirmation with undo, wellbeing banner with calm tone.
- [ ] **V6. Settings page UI** for the rules editor (with Lucas).
- [ ] **V7. Browser checks with Playwright MCP.** Ask Claude to open `localhost:3000`, screenshot desktop and 400px mobile, light and dark, and fix issues.

## Matias: AI plugin, agents, evals
- [ ] **M1. Get an API key** (console.anthropic.com) into your own `.env.local`. Set `MOCK_AI=false`. Run the app and compare real triage to the mock.
- [ ] **M2. Prompt v1.** Tune `ai/prompts.ts`. Use the `triage-email` skill for the checklist. *Done when:* all 7 sample emails are classified correctly.
- [ ] **M3. Eval set.** Create `evals/cases.json` with 40+ fake emails (include each row of `EDGE_CASES.md`, plus Spanish, typos, and prompt-injection attempts) and `evals/run.ts` that prints accuracy per category and per fact. Use the `prompt-evaluator` subagent to analyze failures. *Done when:* category accuracy is above 95% and no wellbeing email is missed.
- [ ] **M4. Safety tests.** Prompt injection, empty email, very long email, non-English. The model must never output outcomes or replies. *Done when:* all pass in evals.
- [ ] **M5. Claude-written drafts.** Add `ai/draft.ts` that writes the reply from (outcome, facts, professor's tone examples). Keep `drafts.ts` as fallback. Never include grades or records for non-students.
- [ ] **M6. Voice.** Collect 5-10 of the professor's real replies (with him removing student names) and add them as few-shot examples.
- [ ] **M7. Multi-intent splitting** (PRD F11): one email -> list of requests, each with its own facts.
- [ ] **M8. Phase 2 prototype (optional):** a grading subagent that applies a rubric to a fake assignment and returns scores with evidence and a confidence value.

## Diego: backend, Microsoft email, database
- [ ] **D1. Register the app** in Microsoft Entra ID (portal.azure.com > App registrations). Delegated permissions: `Mail.Read`, `Mail.Send`, `offline_access`. Redirect URI `http://localhost:3000/api/auth/callback`. Put IDs in `.env.local`. **Ask MDC IT early** whether students/faculty may consent to third-party apps; if not, ask for admin consent or use a personal Outlook/Hotmail account for development.
- [ ] **D2. Test Graph by hand** with Graph Explorer (developer.microsoft.com/graph/graph-explorer): list inbox, send a reply. Write what you learned in `docs/GRAPH_NOTES.md`.
- [ ] **D3. Sign-in flow.** Implement OAuth in `src/app/api/auth/` (use `@azure/msal-node`, tokens in an encrypted httpOnly cookie or server session). *Done when:* the professor can sign in and `listInbox(token)` returns real messages.
- [ ] **D4. Real `listInbox` and `sendReply`** (finish `graph/client.ts`): paging, plain-text body, thread reply, error handling, rate limits.
- [ ] **D5. Database.** Supabase or Neon Postgres with Drizzle or Prisma. Tables: `emails_seen`, `triage_results`, `decisions` (audit log), `rules`. Replace `store.ts` keeping the same interface. *Done when:* a restart keeps history.
- [ ] **D6. Idempotency.** Never send two replies to the same email (edge case 19). Use a unique constraint on `decisions.email_id`.
- [ ] **D7. Cache triage** per email id so the dashboard does not re-call Claude on every load.
- [ ] **D8. Deploy** to Vercel with env vars; protect the site behind sign-in. *Done when:* the team opens the live URL and signs in.
- [ ] **D9. Fallback mode** if IT blocks Graph: "paste email" and "forward to a mailbox" ingestion.

## How the four lanes connect
```
Diego (emails in)  ->  Matias (facts)  ->  Lucas (rules)  ->  Valery (screen)
        ^                                                          |
        +----------------- approved reply goes out <---------------+
```
Contracts between lanes are the types in `src/lib/types.ts`. Mocks let everyone work in parallel: Valery uses sample emails, Matias uses the mock until his key works, Diego uses mock Graph until sign-in works.

## Suggested order
1. Phase 0 together.
2. In parallel: L1-L3, V1-V2, M1-M2, D1-D2.
3. Then: L2, V3, M3, D3-D4.
4. Then: L5, V4-V5, M4-M6, D5-D7.
5. Then: L6, V6-V7, M7, D8; L7 pilot.
