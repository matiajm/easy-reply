import { SAMPLE_EMAILS } from "../sample-emails";
import type { StudentEmail } from "../types";

/**
 * Microsoft Graph client. Owner: Diego.
 * Docs: https://learn.microsoft.com/graph/api/user-list-messages  and  .../message-reply
 * Needs an access token from the Entra ID sign-in flow (see docs/TEAM_PLAN.md, Diego, step D3).
 * MDC is probably a school Microsoft 365 tenant: IT may need to approve the app. Ask early.
 */
const GRAPH = "https://graph.microsoft.com/v1.0";

interface GraphMessage {
  id: string;
  subject: string;
  receivedDateTime: string;
  bodyPreview: string;
  body: { content: string };
  from: { emailAddress: { name: string; address: string } };
}

export async function listInbox(accessToken?: string): Promise<StudentEmail[]> {
  if (process.env.MOCK_GRAPH === "true" || !accessToken) return SAMPLE_EMAILS;

  const res = await fetch(`${GRAPH}/me/mailFolders/inbox/messages?$top=50&$orderby=receivedDateTime desc`, {
    headers: { Authorization: `Bearer ${accessToken}`, Prefer: 'outlook.body-content-type="text"' },
  });
  if (!res.ok) throw new Error(`Graph list failed: ${res.status}`);
  const data = (await res.json()) as { value: GraphMessage[] };
  return data.value.map((m) => ({
    id: m.id,
    from: { name: m.from.emailAddress.name, email: m.from.emailAddress.address },
    course: "", // TODO(Diego): map sender to course via roster or subject tag
    subject: m.subject,
    body: m.body.content,
    receivedAt: m.receivedDateTime,
  }));
}

/** Sends the reply in the same thread. Only ever call this AFTER the professor approved. */
export async function sendReply(messageId: string, text: string, accessToken?: string): Promise<{ simulated: boolean }> {
  if (process.env.MOCK_GRAPH === "true" || !accessToken) return { simulated: true };

  const res = await fetch(`${GRAPH}/me/messages/${messageId}/reply`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ comment: text }),
  });
  if (!res.ok) throw new Error(`Graph reply failed: ${res.status}`);
  return { simulated: false };
}
