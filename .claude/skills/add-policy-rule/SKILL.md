---
name: add-policy-rule
description: Safely add or change one of the professor's rules (extension limits, makeup windows, penalties, documentation requirements). Use whenever a number or rule in src/lib/rules.ts changes or a new rule is requested.
---

# Add or change a policy rule

Rules live in `src/lib/rules.ts` and nowhere else. The AI never decides policy.

## Steps
1. **Confirm the rule in plain words** with the requester: who it applies to, the exact numbers, and what happens at the boundary (exactly 3 days: allowed or not?).
2. **Update `POLICY`** constants first; reference them in the logic. No magic numbers in functions.
3. **Update the evaluation function** (`extension`, `absence`, etc.) so checks show the rule in plain language to the professor, and outcomes include the right recommended one.
4. **Add tests** in `src/lib/rules.test.ts`: below the limit, at the limit, above the limit, and missing facts.
5. **Update `docs/EDGE_CASES.md`** with a row for the new behavior.
6. **Update draft templates** in `src/lib/drafts.ts` if the wording of replies changes (for example the penalty percentage).
7. Run `npm run typecheck && npm test`.
8. In the PR description, quote the rule as the professor stated it and who confirmed it.

## Never
- Add an outcome that changes a grade automatically.
- Add an outcome that sends without professor approval.
- Weaken accommodation handling or `needsHuman` flows.
