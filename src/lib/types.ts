export type Category =
  | "extension"
  | "grade_dispute"
  | "absence"
  | "syllabus"
  | "wellbeing"
  | "third_party"
  | "other";

export type Risk = "low" | "medium" | "high";

/** Facts the AI extracts from the email. The rules engine (not the AI) decides what to do with them. */
export interface TriageFacts {
  assignment?: string | null;
  daysRequested?: number | null;
  priorRequests?: number | null;
  hasAccommodationLetter?: boolean | null;
  hasDocumentation?: boolean | null;
  daysSinceAbsence?: number | null;
  senderIsStudent?: boolean | null;
}

export interface TriageResult {
  category: Category;
  summary: string;
  facts: TriageFacts;
  /** More than one separate request in the same email */
  multiIntent: boolean;
  /** Safety, wellbeing, legal, integrity: a human must write the reply */
  needsHuman: boolean;
}

export interface PolicyCheck {
  status: "ok" | "warn" | "crit";
  label: string;
  message: string;
}

export interface Outcome {
  id: string;
  label: string;
  description: string;
  recommended?: boolean;
  /** Optional parameter, e.g. number of extension days */
  param?: { label: string; options: (string | number)[]; default: string | number };
}

export interface StudentEmail {
  id: string;
  from: { name: string; email: string };
  course: string;
  subject: string;
  body: string;
  receivedAt: string; // ISO date
}

export interface TriagedEmail extends StudentEmail {
  triage: TriageResult;
  risk: Risk;
  checks: PolicyCheck[];
  outcomes: Outcome[];
}

export interface Decision {
  emailId: string;
  outcomeId: string;
  param?: string | number;
  replyText: string;
  approvedBy: string;
  approvedAt: string;
}
