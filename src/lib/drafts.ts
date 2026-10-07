import type { StudentEmail } from "./types";

const PROFESSOR = "Prof. Rivera"; // TODO(Lucas): read from professor settings

const sign = `\n\nBest,\n${PROFESSOR}`;
const first = (e: StudentEmail) => e.from.name.split(" ")[0];

/**
 * Template drafts. Owner: Matias.
 * Later: replace with a Claude call that writes in the professor's voice, but KEEP these as the fallback
 * and as the baseline for evals.
 */
export function draftReply(e: StudentEmail, outcomeId: string, param?: string | number): string {
  const n = first(e);
  switch (outcomeId) {
    case "approve":
      return `Hi ${n},\n\nYes, you can have ${param ?? 1} extra day(s) on this assignment with no penalty. I'll update the deadline for you.${sign}`;
    case "approve_penalty":
      return `Hi ${n},\n\nI can give you 1 extra day with a 10% late penalty, since this is not your first extension this term.${sign}`;
    case "deny":
      return `Hi ${n},\n\nThank you for letting me know. I'm not able to extend this deadline. Late work is accepted with the penalty in the syllabus. If you'd like to talk about a plan for the rest of the term, my office hours are open.${sign}`;
    case "keep":
      return `Hi ${n},\n\nThanks for asking. I looked at the question again against the rubric and I'm keeping the grade as it is. I'm happy to walk through the rubric with you.${sign}`;
    case "regrade":
      return `Hi ${n},\n\nI can't change a grade by email, but you can request a regrade of that question. Please send me a short note on where your work meets the rubric by Friday, and I'll review only that question.${sign}`;
    case "office":
      return `Hi ${n},\n\nLet's go through it together. Please bring your exam to office hours (Tue/Thu, 2:00 PM).${sign}`;
    case "excuse":
      return `Hi ${n},\n\nThank you for the paperwork. Your absence is excused and you can take the makeup on ${param ?? "[date]"}.${sign}`;
    case "docs":
      return `Hi ${n},\n\nThank you for letting me know. Could you send documentation with the date of the absence? Then I'll schedule your makeup right away.${sign}`;
    case "answer":
      return `Hi ${n},\n\nMy office hours are Tuesday and Thursday, 2:00-3:30 PM, Building 3, Room 3211. They are also on page 2 of the syllabus.${sign}`;
    case "ferpa":
      return `Dear ${e.from.name},\n\nFederal privacy law (FERPA) does not allow me to discuss a student's grades or records with anyone other than the student without the student's written consent. I'm glad to speak with the student directly.${sign}`;
    case "personal":
      return `Hi ${n},\n\nThank you for telling me. There is no need to apologize. Please don't worry about the missed work right now.\n\nMDC has free, confidential counseling. I can help you reach someone, or you can reply here or come to office hours. If you ever feel unsafe, call or text 988.${sign}`;
    case "care":
      return `Hi ${n},\n\nThank you for reaching out. I'd like to connect you with someone at the college who can support you. You can also reply here any time.${sign}`;
    case "ignore":
      return "";
    default:
      return `Hi ${n},\n\n${sign.trim()}`;
  }
}
