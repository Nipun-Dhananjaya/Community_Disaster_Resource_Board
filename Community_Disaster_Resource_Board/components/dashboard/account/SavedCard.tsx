"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { demoSavedIds } from "../../../lib/dashboard-demo";
import { categoryMeta, listings, statusClass, statusLabel, statusMark } from "../../../lib/listings";
import { minutes, toneBg, toneBorder } from "../../../lib/tone";
import { Icon } from "../../Icon";
import { Card } from "../ui";

export function SavedCard() {
  // Shows what this person saved on the board; falls back to a sample until they save something.
  const [ids, setIds] = useState<string[]>(demoSavedIds);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cdrb-saved") ?? "[]") as string[];
      if (saved.length) setIds(saved);
    } catch {}
  }, []);
  const items = ids.map((id) => listings.find((l) => l.id === id)).filter((l) => !!l);

  return (
    <Card title="Saved">
      <ul className="space-y-3">
        {items.map((l) => {
          const m = categoryMeta[l.category];
          return (
            <li key={l.id}>
              <Link href={`/board/${l.id}`} className={`flex items-start gap-4 rounded-xl border border-l-[5px] border-line p-4 hover:bg-canvas ${toneBorder[m.tone]}`}>
                <span className={`grid size-10 shrink-0 place-items-center rounded-lg text-white ${toneBg[m.tone]}`}><Icon name={m.icon} /></span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2 text-[17px] font-bold">
                    {l.title}
                    {l.verified && <span className="rounded-md bg-navy px-2 py-0.5 text-[12px] font-bold text-white">✓ Verified</span>}
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-2 text-[16px] font-bold">
                    <span className={`rounded-full px-2.5 py-0.5 text-[13px] ${statusClass[l.status]}`}>{statusMark[l.status]} {statusLabel[l.status]}</span>
                    {l.headline}
                  </span>
                  <span className="mt-1.5 block text-[14px] text-muted">{l.distanceKm.toFixed(1)} km · Updated {minutes(l.updatedMin)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
