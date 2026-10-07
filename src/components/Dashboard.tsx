"use client";

import { useMemo, useState } from "react";
import { draftReply } from "@/lib/drafts";
import type { PolicyCheck, Risk, TriagedEmail } from "@/lib/types";

/**
 * Starter UI. Owner: Valery.
 * It works end to end with mock data. Split it into components (EmailList, EmailDetail, OutcomePicker,
 * ReplyEditor) and restyle it. Keep the behavior: one decision -> editable draft -> human approves.
 */

const RISK: Record<Risk, { label: string; cls: string }> = {
  high: { label: "Needs you", cls: "bg-crit-soft text-crit" },
  medium: { label: "Check", cls: "bg-warn-soft text-warn" },
  low: { label: "Quick", cls: "bg-ok-soft text-ok" },
};
const CHECK_CLS: Record<PolicyCheck["status"], string> = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  crit: "bg-crit-soft text-crit",
};

interface Sel {
  outcomeId: string;
  param?: string | number;
  text?: string;
}

export function Dashboard({ emails }: { emails: TriagedEmail[] }) {
  const [currentId, setCurrentId] = useState<string | null>(emails[0]?.id ?? null);
  const [sel, setSel] = useState<Record<string, Sel>>({});
  const [done, setDone] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const current = emails.find((e) => e.id === currentId) ?? null;
  const todo = emails.filter((e) => !done[e.id]);
  const sent = emails.length - todo.length;

  const state = useMemo(() => {
    if (!current) return null;
    const rec = current.outcomes.find((o) => o.recommended) ?? current.outcomes[0];
    const s = sel[current.id] ?? { outcomeId: rec.id, param: rec.param?.default };
    const outcome = current.outcomes.find((o) => o.id === s.outcomeId) ?? rec;
    return { s, outcome, text: s.text ?? draftReply(current, s.outcomeId, s.param) };
  }, [current, sel]);

  function pick(outcomeId: string) {
    if (!current) return;
    const o = current.outcomes.find((x) => x.id === outcomeId);
    setSel({ ...sel, [current.id]: { outcomeId, param: o?.param?.default } });
  }

  async function send() {
    if (!current || !state) return;
    setBusy(true);
    const res = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailId: current.id, outcomeId: state.outcome.id, param: state.s.param, replyText: state.text }),
    });
    setBusy(false);
    if (res.ok) setDone({ ...done, [current.id]: state.outcome.label });
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">EasyReply</h1>
          <p className="text-sm text-muted">Student emails summarized, checked against your rules, answered with one decision.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <Stat n={todo.length} label="Need a decision" />
          <Stat n={sent} label="Sent today" />
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-[360px_minmax(0,1fr)]">
        <section aria-label="Email queue" className="rounded-lg border border-line bg-surface">
          {emails.map((e) => (
            <button
              key={e.id}
              onClick={() => setCurrentId(e.id)}
              aria-current={e.id === currentId}
              className="block w-full border-t border-line px-4 py-3 text-left first:border-t-0 hover:bg-surface-2 aria-[current=true]:bg-accent-soft"
            >
              <div className="flex justify-between gap-2 font-medium">
                <span>{e.from.name}</span>
                <span className="text-xs font-normal text-muted">{new Date(e.receivedAt).toLocaleDateString()}</span>
              </div>
              <div className="truncate text-sm text-muted">{e.subject}</div>
              <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-accent">{e.triage.category.replace("_", " ")}</span>
                <span className={`rounded-full px-2 py-0.5 ${done[e.id] ? "bg-ok-soft text-ok" : RISK[e.risk].cls}`}>
                  {done[e.id] ?? RISK[e.risk].label}
                </span>
              </div>
            </button>
          ))}
        </section>

        <section className="rounded-lg border border-line bg-surface p-5" aria-live="polite">
          {!current || !state ? (
            <p className="text-muted">Select an email.</p>
          ) : (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-semibold">{current.subject}</h2>
                <p className="text-sm text-muted">
                  {current.from.name} · {current.course}
                </p>
              </div>

              <div className="rounded-md bg-surface-2 p-3 text-sm">{current.triage.summary}</div>

              <ul className="flex flex-col gap-1.5 text-sm">
                {current.checks.map((c, i) => (
                  <li key={i} className="flex items-baseline gap-2">
                    <span className={`min-w-16 rounded px-1.5 text-center text-xs ${CHECK_CLS[c.status]}`}>{c.label}</span>
                    <span>{c.message}</span>
                  </li>
                ))}
              </ul>

              <div className="grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
                {current.outcomes.map((o) => (
                  <button
                    key={o.id}
                    disabled={!!done[current.id]}
                    onClick={() => pick(o.id)}
                    aria-pressed={state.outcome.id === o.id}
                    className="rounded-md border border-line p-2.5 text-left hover:border-accent aria-pressed:border-accent aria-pressed:bg-accent-soft"
                  >
                    {o.recommended && <span className="block text-[10px] uppercase tracking-wide text-accent">Suggested</span>}
                    <b className="block text-sm">{o.label}</b>
                    <span className="text-xs text-muted">{o.description}</span>
                  </button>
                ))}
              </div>

              {state.outcome.param && (
                <label className="flex items-center gap-2 text-sm">
                  {state.outcome.param.label}
                  <select
                    className="rounded border border-line bg-surface px-2 py-1"
                    value={String(state.s.param)}
                    onChange={(ev) => setSel({ ...sel, [current.id]: { outcomeId: state.outcome.id, param: ev.target.value } })}
                  >
                    {state.outcome.param.options.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <textarea
                aria-label="Reply draft"
                className="min-h-48 w-full rounded-md border border-line bg-surface p-3 text-sm"
                value={state.text}
                disabled={!!done[current.id]}
                onChange={(ev) => setSel({ ...sel, [current.id]: { ...state.s, text: ev.target.value } })}
              />

              {done[current.id] ? (
                <p className="rounded-md bg-ok-soft p-2 text-sm text-ok">Handled: {done[current.id]}</p>
              ) : (
                <button
                  onClick={send}
                  disabled={busy}
                  className="self-start rounded-md bg-accent px-4 py-2 font-medium text-accent-fg disabled:opacity-50"
                >
                  {state.outcome.id === "ignore" ? "Archive" : "Approve & send"}
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-1.5">
      <b className="block text-xl tabular-nums">{n}</b>
      <span className="text-[11px] uppercase tracking-wide text-muted">{label}</span>
    </div>
  );
}
