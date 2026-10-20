"use client";

import { useState } from "react";
import { demoOrgRequests, demoVolunteers } from "../../../lib/dashboard-demo";
import { minutes } from "../../../lib/tone";
import { Badge } from "../ui";

const urgency = {
  critical: { tone: "alert", label: "Critical" },
  urgent: { tone: "warn", label: "Urgent" },
  wait: { tone: "ok", label: "Can wait" },
} as const;

export function IncomingRequests() {
  const [accepted, setAccepted] = useState<string[]>([]);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [assigned, setAssigned] = useState<Record<string, string>>({});

  return (
    <section className="rounded-xl border border-line bg-white p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[24px] font-bold">Incoming requests</h2>
        <p className="text-[14px] text-muted">Sorted by urgency</p>
      </div>
      <ul className="mt-3 divide-y divide-line border-t border-line">
        {demoOrgRequests.map((r) => {
          const u = urgency[r.urgency];
          const isAccepted = accepted.includes(r.id);
          return (
            <li key={r.id} className="py-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <div className="min-w-[200px] flex-1">
                  <p className="text-[17px] font-bold">{r.name}</p>
                  <p className="mt-1 text-[14px] text-muted">{r.needs}{assigned[r.id] ? ` · Assigned to ${assigned[r.id]}` : ""}</p>
                </div>
                <Badge tone={u.tone}>{u.label}</Badge>
                <span className="min-w-[80px] text-[15px] text-muted">{minutes(r.minAgo)}</span>
                <div className="flex gap-2">
                  <button type="button" disabled={isAccepted} onClick={() => setAccepted((a) => [...a, r.id])}
                    className="rounded-lg bg-ok px-5 py-2.5 text-[15px] font-bold text-white hover:brightness-110 disabled:opacity-70">
                    {isAccepted ? "Accepted ✓" : "Accept"}
                  </button>
                  <button type="button" aria-expanded={assigning === r.id} onClick={() => setAssigning(assigning === r.id ? null : r.id)}
                    className="rounded-lg border-2 border-navy px-5 py-2 text-[15px] font-bold hover:bg-navy hover:text-white">Assign</button>
                </div>
              </div>
              {assigning === r.id && (
                <div className="mt-3 flex items-center gap-3">
                  <label htmlFor={`v-${r.id}`} className="text-[14px] font-bold">Assign to</label>
                  <select id={`v-${r.id}`} defaultValue="" className="rounded-lg border border-[#b9c6d3] px-3 py-2 text-[15px]"
                    onChange={(e) => { if (e.target.value) { setAssigned((a) => ({ ...a, [r.id]: e.target.value })); setAssigning(null); } }}>
                    <option value="" disabled>Choose a volunteer</option>
                    {demoVolunteers.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
