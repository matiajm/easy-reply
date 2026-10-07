import { triageEmail } from "./ai/triage";
import { listInbox } from "./graph/client";
import { evaluate } from "./rules";
import type { TriagedEmail } from "./types";

/** Pipeline: fetch emails (Diego) -> AI extracts facts (Matias) -> rules decide (Lucas) -> UI shows (Valery). */
export async function getTriagedInbox(accessToken?: string): Promise<TriagedEmail[]> {
  const emails = await listInbox(accessToken);
  return Promise.all(
    emails.map(async (email) => {
      const triage = await triageEmail(email);
      const { risk, checks, outcomes } = evaluate(triage);
      return { ...email, triage, risk, checks, outcomes };
    }),
  );
}
