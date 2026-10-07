import type { Outcome, PolicyCheck, Risk, TriageResult } from "./types";

/**
 * The professor's rules. Owner: Lucas.
 * PRINCIPLE: the AI extracts facts, this file decides. Never let the model pick an outcome on its own.
 * Placeholder values: confirm every number with the professor before the demo.
 */
export const POLICY = {
  extension: {
    firstRequestMaxDays: 3,
    secondRequestMaxDays: 1,
    secondRequestPenaltyPct: 10,
    thirdRequest: "deny_unless_documented" as const,
  },
  absence: { makeupWindowDays: 5, requireDocumentation: true },
  grade: { autoChangeAllowed: false },
};

export interface Evaluation {
  risk: Risk;
  checks: PolicyCheck[];
  outcomes: Outcome[];
}

export function evaluate(t: TriageResult): Evaluation {
  if (t.needsHuman || t.category === "wellbeing") return wellbeing();
  switch (t.category) {
    case "extension":
      return extension(t);
    case "grade_dispute":
      return gradeDispute(t);
    case "absence":
      return absence(t);
    case "syllabus":
      return syllabus();
    case "third_party":
      return thirdParty();
    default:
      return other(t);
  }
}

function extension(t: TriageResult): Evaluation {
  const { facts } = t;
  const prior = facts.priorRequests ?? 0;
  const asked = facts.daysRequested ?? 1;
  const checks: PolicyCheck[] = [];
  const outcomes: Outcome[] = [];
  const p = POLICY.extension;

  if (facts.hasAccommodationLetter) {
    checks.push({ status: "ok", label: "Accommodation", message: "Access Services letter on file. Always honored." });
    outcomes.push({
      id: "approve",
      label: "Approve",
      description: "Honor the accommodation",
      recommended: true,
      param: { label: "Days granted", options: [1, 2, 3, 4, 5], default: asked },
    });
  } else if (prior === 0) {
    const max = p.firstRequestMaxDays;
    checks.push({ status: "ok", label: "Rule", message: `First request: up to ${max} days, no penalty.` });
    if (asked > max) checks.push({ status: "warn", label: "Length", message: `Asked for ${asked} days; rule allows ${max}.` });
    outcomes.push({
      id: "approve",
      label: "Approve",
      description: "Within your first-request rule",
      recommended: true,
      param: { label: "Days granted", options: [1, 2, 3], default: Math.min(asked, max) },
    });
    outcomes.push({ id: "deny", label: "Deny", description: "Keep original deadline" });
  } else if (prior === 1) {
    checks.push({
      status: "warn",
      label: "Rule",
      message: `Second request: ${p.secondRequestMaxDays} day with ${p.secondRequestPenaltyPct}% penalty.`,
    });
    outcomes.push({
      id: "approve_penalty",
      label: "Approve with penalty",
      description: `${p.secondRequestMaxDays} day, ${p.secondRequestPenaltyPct}% off`,
      recommended: true,
    });
    outcomes.push({ id: "deny", label: "Deny", description: "Keep original deadline" });
  } else {
    checks.push({
      status: "crit",
      label: "Rule",
      message: "Third or later request: deny unless documented emergency.",
    });
    if (facts.hasDocumentation) {
      checks.push({ status: "ok", label: "Docs", message: "Documentation attached. Review it." });
    }
    outcomes.push({ id: "deny", label: "Deny kindly", description: "Point to support options", recommended: !facts.hasDocumentation });
    outcomes.push({ id: "approve_penalty", label: "Make an exception", description: "1 day, with penalty", recommended: !!facts.hasDocumentation });
  }
  outcomes.push({ id: "custom", label: "Comment", description: "Write your own reply" });
  return { risk: t.multiIntent ? "medium" : prior >= 2 ? "medium" : "low", checks, outcomes };
}

function gradeDispute(t: TriageResult): Evaluation {
  return {
    risk: "medium",
    checks: [
      { status: "crit", label: "Rule", message: "Grade changes are never automatic." },
      { status: "warn", label: "Evidence", message: "Open the student's work and the rubric before deciding." },
    ],
    outcomes: [
      { id: "keep", label: "Keep grade", description: "Explain the rubric, no change" },
      { id: "regrade", label: "Offer regrade request", description: "Student submits it in writing", recommended: true },
      { id: "office", label: "Meet in office hours", description: "Talk it through in person" },
    ],
  };
}

function absence(t: TriageResult): Evaluation {
  const days = t.facts.daysSinceAbsence ?? 0;
  const checks: PolicyCheck[] = [];
  if (t.facts.hasDocumentation) {
    checks.push({ status: "ok", label: "Docs", message: "Documentation attached. Verify date and signature." });
  } else {
    checks.push({ status: "warn", label: "Docs", message: "No documentation attached." });
  }
  if (days > POLICY.absence.makeupWindowDays) {
    checks.push({ status: "crit", label: "Window", message: `Makeup window is ${POLICY.absence.makeupWindowDays} days; ${days} have passed.` });
  }
  return {
    risk: "medium",
    checks,
    outcomes: [
      {
        id: "excuse",
        label: "Excuse and schedule makeup",
        description: "Documentation received",
        recommended: !!t.facts.hasDocumentation,
        param: { label: "Makeup date", options: ["Thu, Oct 8", "Fri, Oct 9", "Sat, Oct 10"], default: "Fri, Oct 9" },
      },
      { id: "docs", label: "Ask for documentation", description: "Note missing or unclear", recommended: !t.facts.hasDocumentation },
      { id: "deny", label: "Not excused", description: "No makeup" },
    ],
  };
}

function syllabus(): Evaluation {
  return {
    risk: "low",
    checks: [{ status: "ok", label: "Answer", message: "Answer is in the syllabus. Safe to send." }],
    outcomes: [{ id: "answer", label: "Send answer", description: "Hours, room, syllabus link", recommended: true }],
  };
}

function thirdParty(): Evaluation {
  return {
    risk: "high",
    checks: [{ status: "crit", label: "Privacy", message: "Sender is not the student. FERPA: do not discuss grades." }],
    outcomes: [
      { id: "ferpa", label: "Send FERPA reply", description: "Decline, point to the student", recommended: true },
      { id: "ignore", label: "Don't reply", description: "Archive" },
    ],
  };
}

function wellbeing(): Evaluation {
  return {
    risk: "high",
    checks: [
      { status: "crit", label: "Safety", message: "Student may be struggling. Never auto-reply." },
      { status: "warn", label: "Routing", message: "Consider notifying MDC counseling or the care team." },
    ],
    outcomes: [
      { id: "personal", label: "Reply personally", description: "Warm message with support options", recommended: true },
      { id: "care", label: "Refer to care team", description: "Short note and flag" },
    ],
  };
}

function other(t: TriageResult): Evaluation {
  return {
    risk: t.multiIntent ? "medium" : "low",
    checks: [{ status: "warn", label: "Unclear", message: "Could not match a known category. Read the original." }],
    outcomes: [{ id: "custom", label: "Comment", description: "Write your own reply", recommended: true }],
  };
}
