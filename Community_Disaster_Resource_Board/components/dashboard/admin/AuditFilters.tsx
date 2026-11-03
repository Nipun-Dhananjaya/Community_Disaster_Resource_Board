"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { rangeOptions } from "../../../lib/audit-filter";

const sel = "rounded-lg border border-[#b9c6d3] bg-white px-4 py-3 text-[15px] font-semibold";

export function AuditFilters({ q, role, action, range, actions }: { q: string; role: string; action: string; range: string; actions: string[] }) {
  const router = useRouter();
  const [query, setQuery] = useState(q);
  const first = useRef(true);

  const go = (next: Partial<{ q: string; role: string; action: string; range: string }>) => {
    const p = new URLSearchParams();
    const v = { q: query, role, action, range, ...next };
    if (v.q) p.set("q", v.q);
    if (v.role !== "all") p.set("role", v.role);
    if (v.action !== "all") p.set("action", v.action);
    if (v.range !== "24h") p.set("range", v.range);
    router.replace(`/admin/audit-log${p.toString() ? `?${p}` : ""}`);
  };

  // Search as you type, after a short pause
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(() => go({ q: query }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <form role="search" onSubmit={(e) => { e.preventDefault(); go({}); }} className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white p-3">
      <label htmlFor="a-q" className="sr-only">Search by person, action or listing</label>
      <input id="a-q" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by person, action or listing" className="min-w-[220px] flex-1 rounded-lg border border-[#b9c6d3] px-4 py-3 text-[16px] placeholder:text-muted" />
      <label className="sr-only" htmlFor="a-role">Role</label>
      <select id="a-role" value={role} onChange={(e) => go({ role: e.target.value })} className={sel}>
        <option value="all">Role: All</option><option value="admin">Role: Admin</option><option value="moderator">Role: Moderator</option><option value="unknown">Role: Unknown</option>
      </select>
      <label className="sr-only" htmlFor="a-action">Action</label>
      <select id="a-action" value={action} onChange={(e) => go({ action: e.target.value })} className={sel}>
        <option value="all">Action: All</option>
        {actions.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
      <label className="sr-only" htmlFor="a-range">Time range</label>
      <select id="a-range" value={range} onChange={(e) => go({ range: e.target.value })} className={sel}>
        {rangeOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select>
    </form>
  );
}
