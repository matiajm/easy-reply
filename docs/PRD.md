# PRD: EasyReply

Status: Draft v0.1 · Owner: Lucas · Team: Valery, Matias, Diego, Lucas

## 1. Problem
A professor at MDC teaches many classes and receives a large volume of student emails: extension requests, grade disputes, absence notes, and logistics questions. Reading, deciding, and writing each reply takes time he does not have, and most replies follow a few patterns.

Second problem (later phase): grading volume across many classes. Out of scope for this PRD, see section 11.

## 2. Goal
Cut the professor's time per email from minutes to seconds by turning each email into: a short summary, a check against his own rules, a small set of outcomes, and a ready reply. He makes one click; the system writes and sends the reply.

## 3. Users
- **Primary: the professor.** Busy, wants control, worries about mistakes and fairness.
- **Secondary: students.** Want fast, clear, consistent answers.
- **Stakeholders:** MDC IT (Microsoft 365 permissions, privacy).

## 4. Success metrics
- Median time to handle an email under 30 seconds (baseline to measure with the professor).
- At least 70% of emails answered with the suggested outcome and little or no editing.
- Zero replies sent without professor approval.
- Zero privacy incidents (no grades or records to non-students).
- Professor rates the dashboard 4 of 5 or higher after a one-week pilot.

## 5. Scope (MVP)
In scope:
1. Read emails from the professor's Outlook inbox (Microsoft Graph), read-only until approval.
2. Classify each email and extract key facts with Claude.
3. Evaluate facts against the professor's rules (config file).
4. Dashboard: queue sorted by risk, summary, rule checks, outcome buttons, editable draft, "Approve & send".
5. Send reply in the same thread via Graph.
6. Audit log of every decision (who, when, exact text).
7. Categories: extension, grade dispute, absence/makeup, syllabus/logistics, plus safe handling of wellbeing, third-party senders, and unknown.

Out of scope for MVP: grading automation, auto-send without approval, LMS integration (Canvas/Blackboard), mobile app, multiple professors.

## 6. User flow
1. Professor opens the dashboard. Emails are already summarized and sorted: "Needs you", "Check", "Quick".
2. He selects an email, reads the 1-2 sentence summary and the rule checks.
3. He clicks an outcome (a suggested one is highlighted), optionally adjusts a parameter (days, makeup date).
4. The reply appears. He edits if needed.
5. He clicks "Approve & send". The reply goes out; the email moves to Sent.
6. He can undo within a short window (stretch goal).

## 7. Functional requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | Fetch inbox messages via Microsoft Graph, with mock mode | Must |
| F2 | Triage with Claude tool use returning validated JSON (category, summary, facts, flags) | Must |
| F3 | Rules engine returns checks, risk, and allowed outcomes from facts | Must |
| F4 | Dashboard with queue, detail, outcomes, editable reply | Must |
| F5 | Human approval gate; only one code path can send | Must |
| F6 | Audit log persisted in a database | Must |
| F7 | Wellbeing and safety emails are flagged, never auto-drafted for sending | Must |
| F8 | FERPA-safe replies to non-students | Must |
| F9 | Professor edits rules in a settings page | Should |
| F10 | Claude-written drafts in the professor's voice, template fallback | Should |
| F11 | Multi-intent emails split into separate decisions | Should |
| F12 | Student history (prior requests) from past emails or roster | Should |
| F13 | Undo send within 30 seconds | Could |
| F14 | Weekly digest of handled emails | Could |

## 8. Non-functional requirements
- **Privacy:** Student data is protected by FERPA. Store the minimum. No real data in the repo. Send only the email text needed to Claude. Confirm Anthropic data-handling terms with MDC before real use.
- **Safety:** Treat email content as untrusted (prompt injection). The model never selects outcomes or sends mail.
- **Reliability:** If Claude or Graph fails, the email stays in the queue marked "Needs you". No silent failures.
- **Accessibility:** WCAG 2.1 AA, keyboard operable, works in light and dark mode.
- **Performance:** Dashboard loads under 3 seconds with 50 emails; triage runs in parallel and is cached per email.
- **Auditability:** Every sent reply is traceable to an approval.

## 9. Architecture
```
Outlook (Microsoft Graph) -> fetch -> Claude triage (facts) -> rules engine (outcomes)
   -> Dashboard (professor decides) -> draft -> professor approves -> Graph sendReply -> audit log
```
Key decision: **AI extracts, code decides.** Claude is accurate at reading messy text but should not own policy. Policy lives in `src/lib/rules.ts`, which is deterministic, testable, and editable by the professor.

## 10. Edge cases
See `docs/EDGE_CASES.md`. Highlights: repeated requests, accommodation letters, multi-intent emails, parents writing, distress messages, prompt injection in emails, wrong-language emails, emails with only attachments, and reply-all threads.

## 11. Phase 2: grading (backlog)
Ideas to evaluate after the email MVP: Claude grades against a rubric and shows reasoning, professor reviews only low-confidence or borderline items; separate subagents per assignment type; sampling audits; never an automatic final grade without review. Needs its own PRD.

## 12. Risks and open questions
| Risk / question | Owner | Mitigation |
|---|---|---|
| MDC IT may block third-party Graph apps | Diego | Ask IT early; fall back to a forwarded-mail or manual-paste mode |
| Real extension/grade rules are placeholders | Lucas | Interview the professor, fill `rules.ts` |
| Model mistakes on facts (e.g. prior requests) | Matias | Evals; show facts in the UI so the professor can catch errors |
| Privacy of sending student text to an AI API | Lucas | Check college policy; redact names before the API call if required |
| Professor distrusts auto-drafts | Valery | Show the reasoning and always allow edits |

Questions for the professor: exact deadline and late rules; grade dispute process; documentation requirements; which emails he never wants drafted; tone of voice samples (5-10 past replies); how to identify courses/sections.

## 13. Milestones
1. **M0 Setup:** repo, tooling, Claude config, mock app runs for everyone.
2. **M1 Mock end to end:** sample emails -> triage -> rules -> UI -> simulated send.
3. **M2 Real AI:** Claude triage with evals passing on a fake dataset.
4. **M3 Real email:** Microsoft sign-in, read inbox, send reply, audit log in database.
5. **M4 Pilot:** professor uses it for one week with approvals on; collect metrics.
6. **M5 Polish and phase 2 plan:** settings page, drafts in his voice, grading PRD.
