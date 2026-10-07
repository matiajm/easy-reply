---
description: Add a new email category end to end (type, prompt, rules, drafts, UI, tests)
argument-hint: <category_name>
---

Add a new student-email category called `$ARGUMENTS`. Plan first, show me the plan, then do it in this order:

1. `src/lib/types.ts`: add to the `Category` union and any new fact fields.
2. `src/lib/ai/prompts.ts`: add to the tool enum and the facts schema; update `src/lib/ai/triage.ts` Zod schema and `mockTriage`.
3. `src/lib/rules.ts`: add an evaluation function returning risk, checks, and outcomes (one recommended).
4. `src/lib/drafts.ts`: add draft templates for each new outcome id.
5. Add a fake sample email to `src/lib/sample-emails.ts`.
6. `src/components/Dashboard.tsx`: confirm the category label renders correctly.
7. Add tests in `src/lib/rules.test.ts` and a row in `docs/EDGE_CASES.md`.
8. Run `npm run typecheck && npm test`.

Follow the rules in CLAUDE.md. Use the `test-writer` subagent for step 7 and the `ferpa-reviewer` subagent at the end.
