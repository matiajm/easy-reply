import { describe, expect, it } from "vitest";
import { evaluate } from "./rules";
import type { TriageResult } from "./types";

const base: TriageResult = {
  category: "extension",
  summary: "",
  facts: {},
  multiIntent: false,
  needsHuman: false,
};

describe("rules engine", () => {
  it("recommends approve for a first extension request", () => {
    const r = evaluate({
      ...base,
      facts: { priorRequests: 0, daysRequested: 2 },
    });
    expect(r.outcomes.find((o) => o.recommended)?.id).toBe("approve");
  });

  it("allows a first extension of exactly one week", () => {
    const r = evaluate({
      ...base,
      facts: { priorRequests: 0, daysRequested: 7 },
    });
    const approve = r.outcomes.find((o) => o.id === "approve");
    expect(approve?.recommended).toBe(true);
    expect(approve?.param?.default).toBe(7);
    expect(r.checks.some((c) => c.label === "Length")).toBe(false);
  });

  it("allows a first extension under one week", () => {
    const r = evaluate({
      ...base,
      facts: { priorRequests: 0, daysRequested: 6 },
    });
    expect(r.outcomes.find((o) => o.id === "approve")?.param?.default).toBe(6);
    expect(r.checks.some((c) => c.label === "Length")).toBe(false);
  });

  it("caps a first extension above one week at 7 days", () => {
    const r = evaluate({
      ...base,
      facts: { priorRequests: 0, daysRequested: 8 },
    });
    const approve = r.outcomes.find((o) => o.id === "approve");
    expect(approve?.recommended).toBe(true);
    expect(approve?.param?.default).toBe(7);
    expect(approve?.param?.options).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(r.checks.some((c) => c.label === "Length")).toBe(true);
  });

  it("treats a missing days request as one day", () => {
    const r = evaluate({ ...base, facts: { priorRequests: 0 } });
    expect(r.outcomes.find((o) => o.recommended)?.id).toBe("approve");
    expect(r.outcomes.find((o) => o.id === "approve")?.param?.default).toBe(1);
  });

  it("asks for documentation when an absence has none attached", () => {
    const r = evaluate({
      ...base,
      category: "absence",
      facts: { hasDocumentation: false, daysSinceAbsence: 1 },
    });
    expect(r.outcomes.find((o) => o.recommended)?.id).toBe("docs");
  });

  it("asks for documentation when the attachment fact is missing", () => {
    const r = evaluate({
      ...base,
      category: "absence",
      facts: { daysSinceAbsence: 1 },
    });
    expect(r.outcomes.find((o) => o.recommended)?.id).toBe("docs");
  });

  it("recommends a makeup when documentation is attached", () => {
    const r = evaluate({
      ...base,
      category: "absence",
      facts: { hasDocumentation: true, daysSinceAbsence: 1 },
    });
    expect(r.outcomes.find((o) => o.recommended)?.id).toBe("excuse");
  });

  it("recommends deny on a third request without documentation", () => {
    const r = evaluate({ ...base, facts: { priorRequests: 2 } });
    expect(r.outcomes.find((o) => o.recommended)?.id).toBe("deny");
  });

  it("always honors an accommodation letter", () => {
    const r = evaluate({
      ...base,
      facts: { priorRequests: 5, hasAccommodationLetter: true },
    });
    expect(r.outcomes.find((o) => o.recommended)?.id).toBe("approve");
  });

  it("never auto-handles wellbeing emails", () => {
    const r = evaluate({ ...base, category: "wellbeing", needsHuman: true });
    expect(r.risk).toBe("high");
  });

  it("never offers a direct grade change", () => {
    const r = evaluate({ ...base, category: "grade_dispute" });
    expect(r.outcomes.some((o) => o.id === "change_grade")).toBe(false);
  });
});
