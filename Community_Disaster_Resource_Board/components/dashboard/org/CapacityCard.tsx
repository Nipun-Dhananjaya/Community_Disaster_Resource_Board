"use client";

import { useState } from "react";
import { postJson } from "../../../lib/client-auth";

type Status = "available" | "limited" | "full";
const chips: { key: Status; label: string; cls: string; mark: string }[] = [
  { key: "available", label: "Available", cls: "bg-ok-soft text-ok", mark: "●" },
  { key: "limited", label: "Limited", cls: "bg-warn-soft text-[#8a4a0a]", mark: "▲" },
  { key: "full", label: "Full", cls: "bg-[#e3e8ee] text-[#3f5163]", mark: "■" },
];

export function CapacityCard({ beds: initial, total, status: initialStatus, confirmedMinAgo }: { beds: number; total: number; status: Status; confirmedMinAgo: number }) {
  const [beds, setBeds] = useState(initial);
  const [status, setStatus] = useState<Status>(initialStatus);
  const [ago, setAgo] = useState<number>(confirmedMinAgo);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function change(n: number) {
    const next = Math.min(total, Math.max(0, n));
    setBeds(next);
    setStatus(next === 0 ? "full" : next <= Math.ceil(total * 0.1) ? "limited" : "available");
    setMsg(null);
  }

  async function save() {
    setBusy(true); setMsg(null);
    const r = await postJson<{ error?: string }>("/api/org/capacity", { beds, status });
    setBusy(false);
    if (r.ok) { setAgo(0); setMsg("Published. People can see the new count now."); }
    else setMsg(r.data.error ?? "Couldn’t save. Please try again.");
  }

  return (
    <section className="rounded-xl border border-line bg-white p-6">
      <h2 className="font-display text-[24px] font-bold">Update capacity</h2>
      <div className="mt-5 flex items-center justify-between gap-3">
        <button type="button" aria-label="Remove one bed" onClick={() => change(beds - 1)} className="size-[66px] rounded-xl border-2 border-navy text-[28px] font-bold hover:bg-navy hover:text-white">−</button>
        <div className="text-center">
          <p aria-live="polite" className="font-display text-[64px] font-bold leading-none text-ok">{beds}</p>
          <p className="mt-2 text-[15px] text-muted">beds free of {total}</p>
        </div>
        <button type="button" aria-label="Add one bed" onClick={() => change(beds + 1)} className="size-[66px] rounded-xl border-2 border-navy text-[28px] font-bold hover:bg-navy hover:text-white">+</button>
      </div>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Status">
        {chips.map((c) => (
          <button key={c.key} type="button" aria-pressed={status === c.key} onClick={() => setStatus(c.key)}
            className={`rounded-full px-3 py-1 text-[14px] font-bold ${c.cls} ${status === c.key ? "ring-2 ring-navy" : "opacity-80"}`}>
            {c.mark} {c.label}
          </button>
        ))}
      </div>
      <button type="button" onClick={save} disabled={busy} className="mt-5 w-full rounded-lg bg-navy py-4 text-[17px] font-bold text-white hover:bg-navy-soft disabled:opacity-60">
        {busy ? "Saving…" : "Save and publish"}
      </button>
      <p role="status" className="mt-3 text-[14px] leading-6 text-muted">
        {msg ?? `Last confirmed ${ago === 0 ? "just now" : `${ago} min ago`}. Listings expire after 6 hours without an update.`}
      </p>
    </section>
  );
}
