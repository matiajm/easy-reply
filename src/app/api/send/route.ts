import { NextResponse } from "next/server";
import { z } from "zod";
import { sendReply } from "@/lib/graph/client";
import { store } from "@/lib/store";

const Body = z.object({
  emailId: z.string(),
  outcomeId: z.string(),
  param: z.union([z.string(), z.number()]).optional(),
  replyText: z.string(),
});

/**
 * Human-in-the-loop gate. This route is the ONLY place a reply can leave the system,
 * and it only runs when the professor clicks "Approve & send".
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const d = parsed.data;

  if (store.has(d.emailId)) return NextResponse.json({ error: "Already handled" }, { status: 409 });

  // TODO(Diego): read the access token from the session once Microsoft sign-in exists
  const result = d.outcomeId === "ignore" ? { simulated: true } : await sendReply(d.emailId, d.replyText);

  store.add({ ...d, approvedBy: "professor", approvedAt: new Date().toISOString() });
  return NextResponse.json({ ok: true, simulated: result.simulated });
}
