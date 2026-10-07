import type { Decision } from "./types";

/**
 * In-memory audit log. Owner: Diego.
 * TODO(Diego): replace with Postgres (Supabase/Neon + Drizzle or Prisma). Keep this same interface
 * so the API routes do not change. Every sent reply must be stored: who approved, when, and the exact text.
 */
const decisions: Decision[] = [];

export const store = {
  add(d: Decision) {
    decisions.push(d);
  },
  all(): Decision[] {
    return [...decisions];
  },
  has(emailId: string) {
    return decisions.some((d) => d.emailId === emailId);
  },
};
