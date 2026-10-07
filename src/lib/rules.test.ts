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
    const r = evaluate({ ...base, facts: { priorRequests: 0, daysRequested: 2 } });
    expect(r.outcomes.find((o) => o.recommended)?.id).toBe("approve");
  });

  it("recommends deny on a third request without documentation", () => {
    const r = evaluate({ ...base, facts: { priorRequests: 2 } });
    expect(r.outcomes.find((o) => o.recommended)?.id).toBe("deny");
  });

  it("always honors an accommodation letter", () => {
    const r = evaluate({ ...base, facts: { priorRequests: 5, hasAccommodationLetter: true } });
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
