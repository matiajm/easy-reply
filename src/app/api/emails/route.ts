import { NextResponse } from "next/server";
import { getTriagedInbox } from "@/lib/inbox";

export async function GET() {
  const emails = await getTriagedInbox();
  return NextResponse.json({ emails });
}
