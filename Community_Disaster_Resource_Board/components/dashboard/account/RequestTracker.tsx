"use client";

import Link from "next/link";
import { useState } from "react";
import { demoRequest } from "../../../lib/dashboard-demo";
import { Badge } from "../ui";

const steps = ["Submitted", "Verified", "Matched", "In progress", "Fulfilled"];

export function RequestTracker() {
  const r = demoRequest;
  const [stage, setStage] = useState(r.stage);
  const done = stage >= 4;
  return (
    <section className="rounded-xl border border-line bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[22px] font-bold">Request #{r.ref}: {r.title}</h2>
        <Badge tone={done ? "ok" : "warn"}>{done ? "✓" : "▲"} {steps[stage]}</Badge>
      </div>
      <ol className="mt-4 grid grid-cols-5 gap-3" aria-label="Request progress">
        {steps.map((s, i) => (
          <li key={s} aria-current={i === stage ? "step" : undefined} className="text-center">
            <div className={`h-2 rounded-full ${i <= stage ? "bg-ok" : "bg-[#c8d3de]"}`} />
            <p className={`mt-2 text-[13px] sm:text-[15px] ${i <= stage ? "font-bold text-navy" : "text-muted"}`}>{s}</p>
          </li>
        ))}
      </ol>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-[720px] text-[16px] leading-7 text-muted">
          Assigned to {r.assigned}. Message from the manager: “{r.message}”
        </p>
        <div className="flex gap-3">
          <Link href="/account/messages" className="rounded-lg border-2 border-navy px-5 py-2.5 text-[15px] font-bold hover:bg-navy hover:text-white">Message</Link>
          <button type="button" disabled={done} onClick={() => setStage(4)} className="rounded-lg bg-ok px-5 py-2.5 text-[15px] font-bold text-white hover:brightness-110 disabled:opacity-60">
            {done ? "Fulfilled" : "Mark fulfilled"}
          </button>
        </div>
      </div>
    </section>
  );
}
