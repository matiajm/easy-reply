# Evals (owner: Matias)

Create `cases.json` (40+ fake emails with expected category and facts) and `run.ts` that calls `triageEmail` on each case and prints accuracy per category and per fact. See TEAM_PLAN step M3.

Case shape:
```json
{ "id": "c1", "email": { "...StudentEmail" : "" }, "expect": { "category": "extension", "needsHuman": false, "multiIntent": false, "facts": { "priorRequests": 0 } } }
```
