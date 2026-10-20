"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJson } from "../../../lib/client-auth";
import { Badge } from "../ui";

export interface QueueRow { id: string; title: string; note: string; kind: "verify_shelter" | "flagged" | "verify_team"; waitingMin: number; status: "waiting" | "in_review" }

const kindLabel = { verify_shelter: "Verify shelter", flagged: "Flagged", verify_team: "Verify team" } as const;

export function ModerationQueue({ rows: initial }: { rows: QueueRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(id: string, action: "approve" | "remove" | "review" | "edit", title?: string) {
    setBusy(id); setError(null);
    const r = await postJson<{ error?: string }>("/api/admin/moderation", { id, action, title });
    setBusy(null);
    if (!r.ok) { setError(r.data.error ?? "That didn’t work. Please try again."); return; }
    setRows((list) =>
      action === "approve" || action === "remove" ? list.filter((x) => x.id !== id)
      : action === "review" ? list.map((x) => (x.id === id ? { ...x, status: "in_review" as const } : x))
      : list.map((x) => (x.id === id ? { ...x, title: title ?? x.title } : x)));
    if (action === "edit") setEditing(null);
    router.refresh();
  }

  const btn = "rounded-lg border-2 border-navy px-4 py-2 text-[15px] font-bold hover:bg-navy hover:text-white disabled:opacity-60";
  return (
    <div>
      {error && <p role="alert" className="mb-3 rounded-lg border border-[#e8b4ae] bg-alert-soft p-3 text-[15px] font-bold text-alert">{error}</p>}
      {rows.length === 0 ? (
        <p className="py-6 text-[16px] text-muted">Nothing is waiting. The queue is clear.</p>
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {rows.map((r) => (
            <li key={r.id} className="py-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <div className="min-w-[200px] flex-1">
                  <p className="text-[17px] font-bold">{r.title}</p>
                  <p className="mt-1 text-[14px] text-muted">{r.note}</p>
                </div>
                {r.status === "in_review" ? <Badge tone="neutral">In review</Badge> : <Badge tone={r.kind === "flagged" ? "warn" : "ok"}>{r.kind === "flagged" ? "▲ " : ""}{kindLabel[r.kind]}</Badge>}
                <span className="min-w-[56px] text-[15px] text-muted">{r.waitingMin} min</span>
                <div className="flex gap-2">
                  {r.kind === "flagged" ? (
                    <>
                      <button type="button" className={btn} disabled={busy === r.id || r.status === "in_review"} onClick={() => act(r.id, "review")}>Review</button>
                      <button type="button" disabled={busy === r.id} onClick={() => act(r.id, "remove")} className="rounded-lg bg-alert px-4 py-2.5 text-[15px] font-bold text-white hover:brightness-110 disabled:opacity-60">Remove</button>
                    </>
                  ) : (
                    <>
                      <button type="button" disabled={busy === r.id} onClick={() => act(r.id, "approve")} className="rounded-lg bg-ok px-4 py-2.5 text-[15px] font-bold text-white hover:brightness-110 disabled:opacity-60">Approve</button>
                      <button type="button" className={btn} aria-expanded={editing === r.id} onClick={() => { setEditing(editing === r.id ? null : r.id); setDraft(r.title); }}>Edit</button>
                    </>
                  )}
                </div>
              </div>
              {editing === r.id && (
                <form className="mt-3 flex flex-wrap items-center gap-3" onSubmit={(e) => { e.preventDefault(); if (draft.trim().length >= 2) act(r.id, "edit", draft.trim()); }}>
                  <label htmlFor={`t-${r.id}`} className="text-[14px] font-bold">Title</label>
                  <input id={`t-${r.id}`} value={draft} onChange={(e) => setDraft(e.target.value)} className="min-w-[220px] flex-1 rounded-lg border border-[#b9c6d3] px-3 py-2 text-[15px]" />
                  <button type="submit" className="rounded-lg bg-navy px-4 py-2 text-[15px] font-bold text-white">Save</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
