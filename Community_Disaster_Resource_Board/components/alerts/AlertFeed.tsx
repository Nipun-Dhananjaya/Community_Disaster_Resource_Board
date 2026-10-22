"use client";

import Link from "next/link";
import { useState } from "react";

export interface FeedAlert {
  id: string; title: string; body: string; source: string; near: string; minAgo: number;
  kind: "official" | "road" | "weather" | "platform"; severity: "high" | "medium" | "low";
}

const chips = [
  { key: "all", label: "All" }, { key: "official", label: "Official alerts" }, { key: "road", label: "Road closures" },
  { key: "weather", label: "Weather" }, { key: "platform", label: "Platform news" },
] as const;

function look(a: FeedAlert) {
  if (a.kind === "platform") return { badge: "bg-navy text-white", label: "Platform", mark: "", border: "border-l-navy" };
  if (a.severity === "high") return { badge: "bg-alert-soft text-alert", label: "Severe", mark: "▲ ", border: "border-l-alert" };
  if (a.severity === "medium") return { badge: "bg-warn-soft text-[#8a4a0a]", label: "Warning", mark: "▲ ", border: "border-l-warn" };
  return { badge: "bg-[#e3e8ee] text-[#3f5163]", label: "Advisory", mark: "■ ", border: "border-l-ride" };
}
const ago = (m: number) => (m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`);

export function AlertFeed({ alerts }: { alerts: FeedAlert[] }) {
  const [filter, setFilter] = useState<(typeof chips)[number]["key"]>("all");
  const shown = alerts.filter((a) => filter === "all" || a.kind === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter alerts">
        {chips.map((c) => (
          <button
            key={c.key} type="button" aria-pressed={filter === c.key} onClick={() => setFilter(c.key)}
            className={`rounded-full border px-5 py-2 text-[15px] font-bold ${filter === c.key ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-navy"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <ul className="mt-5 space-y-4" aria-live="polite">
        {shown.map((a) => {
          const l = look(a);
          return (
            <li key={a.id}>
              <article className={`rounded-xl border border-l-[6px] border-line bg-white p-5 sm:p-6 ${l.border}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="flex flex-wrap items-center gap-3 text-[19px] font-bold">
                    <span className={`rounded-full px-2.5 py-0.5 text-[13px] ${l.badge}`}>{l.mark}{l.label}</span>
                    {a.title}
                  </h3>
                  <p className="text-[14px] text-muted">{ago(a.minAgo)}</p>
                </div>
                <p className="mt-3 text-[16px] leading-7 text-muted">{a.body}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <Link href={`/board?near=${encodeURIComponent(a.near)}`} className="rounded-lg border-2 border-navy px-4 py-2.5 text-[15px] font-bold hover:bg-navy hover:text-white">
                    Related resources
                  </Link>
                  <p className="text-[14px] font-semibold">Source: {a.source}</p>
                </div>
              </article>
            </li>
          );
        })}
        {shown.length === 0 && (
          <li className="rounded-xl border border-line bg-white p-6 text-[16px] text-muted">No alerts in this category right now.</li>
        )}
      </ul>
    </div>
  );
}
