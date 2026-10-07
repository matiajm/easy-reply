import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { StudentEmail, TriageResult } from "../types";
import { TRIAGE_SYSTEM_PROMPT, TRIAGE_TOOL } from "./prompts";

const TriageSchema = z.object({
  category: z.enum(["extension", "grade_dispute", "absence", "syllabus", "wellbeing", "third_party", "other"]),
  summary: z.string(),
  multiIntent: z.boolean(),
  needsHuman: z.boolean(),
  facts: z
    .object({
      assignment: z.string().nullish(),
      daysRequested: z.number().nullish(),
      priorRequests: z.number().nullish(),
      hasAccommodationLetter: z.boolean().nullish(),
      hasDocumentation: z.boolean().nullish(),
      daysSinceAbsence: z.number().nullish(),
      senderIsStudent: z.boolean().nullish(),
    })
    .default({}),
});

/** Owner: Matias. Uses Claude tool-use to force structured output. Falls back to the mock if MOCK_AI=true. */
export async function triageEmail(email: StudentEmail): Promise<TriageResult> {
  if (process.env.MOCK_AI === "true" || !process.env.ANTHROPIC_API_KEY) return mockTriage(email);

  const client = new Anthropic();
  const res = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5",
    max_tokens: 1024,
    system: TRIAGE_SYSTEM_PROMPT,
    tools: [TRIAGE_TOOL],
    tool_choice: { type: "tool", name: TRIAGE_TOOL.name },
    messages: [
      {
        role: "user",
        content: `From: ${email.from.name} <${email.from.email}>\nCourse: ${email.course}\nSubject: ${email.subject}\n\n${email.body}`,
      },
    ],
  });

  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") throw new Error("Model did not return a tool call");
  return TriageSchema.parse(block.input) as TriageResult;
}

/** Keyword mock so the whole team can run the app with no API key. Replace nothing here; just add real calls above. */
export function mockTriage(e: StudentEmail): TriageResult {
  const t = `${e.subject} ${e.body}`.toLowerCase();
  const base = { multiIntent: false, needsHuman: false };
  if (/can't keep doing|too much right now|hopeless|hurt myself/.test(t))
    return { ...base, category: "wellbeing", needsHuman: true, summary: "The student says they are struggling and may stop attending.", facts: { senderIsStudent: true } };
  if (/my son|my daughter|i'm .* (father|mother)/.test(t))
    return { ...base, category: "third_party", summary: "A parent asks about a student's grade.", facts: { senderIsStudent: false } };
  if (/office hours|syllabus|what time|where/.test(t))
    return { ...base, category: "syllabus", summary: "The student asks a question answered in the syllabus.", facts: { senderIsStudent: true } };
  if (/exam|missed|makeup|hospital|er /.test(t))
    return { ...base, category: "absence", summary: "The student missed an exam and asks for a makeup.", facts: { hasDocumentation: /attached|paperwork|note/.test(t), daysSinceAbsence: 1, senderIsStudent: true } };
  if (/grade|regrade|question \d|midterm/.test(t))
    return { ...base, category: "grade_dispute", summary: "The student disputes a grade and asks for a change.", facts: { senderIsStudent: true } };
  if (/extension|extend|more time|turn it in|deadline/.test(t)) {
    const third = /third time|same as last time/.test(t);
    return { ...base, category: "extension", summary: "The student asks for more time on an assignment.", facts: { priorRequests: third ? 2 : 0, daysRequested: 4, senderIsStudent: true } };
  }
  return { ...base, category: "other", summary: "Could not classify this email.", facts: {} };
}
