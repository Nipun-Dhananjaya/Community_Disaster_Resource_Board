"use client";

import { useState } from "react";
import { periodLabel, periods, reports, Period } from "../../../lib/reports-demo";
import { OrgFrame } from "../frames";
import { Card, StatCard } from "../ui";

export function ReportsApp({ orgName }: { orgName: string }) {
  const [period, setPeriod] = useState<Period>("week");
  const r = reports[period];
  const max = Math.max(...r.chart.map((c) => c.value));
  const q = (extra = "") => `/api/org/reports/export?period=${period}${extra}`;
  const chip = (on: boolean) => `rounded-full border px-4 py-2 text-[15px] font-bold ${on ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-navy"}`;

  return (
    <OrgFrame
      title="Reports" subtitle={`${orgName} · ${r.subtitle}`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Time period" className="flex gap-2">
            {periods.map((p) => <button key={p} type="button" aria-pressed={period === p} onClick={() => setPeriod(p)} className={chip(period === p)}>{periodLabel[p]}</button>)}
          </div>
          <a href={q("&format=csv")} download className="rounded-lg border-2 border-navy px-4 py-2.5 text-[15px] font-bold hover:bg-navy hover:text-white">Export CSV</a>
          <a href={q("&format=pdf")} download className="rounded-lg bg-navy px-4 py-3 text-[15px] font-bold text-white hover:bg-navy-soft">Export PDF</a>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="People sheltered" value={r.people.value.toLocaleString("en-GB")} note={r.people.note} />
        <StatCard label="Meals served" value={r.meals.value.toLocaleString("en-GB")} note={r.meals.note} />
        <StatCard label="Requests fulfilled" value={r.fulfilled.value} valueClass="text-ok" note={`of ${r.fulfilled.of} received`} />
        <StatCard label="Avg. response time" value={`${r.response.min} min`} valueClass="text-ok" note={r.response.note} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Card title={r.chartTitle}>
          <ul className="flex h-[260px] items-end justify-between gap-2 border-b-2 border-[#c8d3de] px-1 pt-6" aria-label={r.chartTitle}>
            {r.chart.map((c) => (
              <li key={c.label} className="flex h-full flex-1 flex-col items-center justify-end">
                <span className="mb-1 text-[14px] font-bold">{c.value}</span>
                <span className="w-full max-w-[48px] rounded-t-lg bg-navy" style={{ height: `${(c.value / max) * 82}%` }} aria-hidden="true" />
              </li>
            ))}
          </ul>
          <ul className="mt-2 flex justify-between gap-2 px-1">
            {r.chart.map((c) => <li key={c.label} className="flex-1 text-center text-[14px] font-semibold text-muted">{c.label}</li>)}
          </ul>
        </Card>

        <Card title="Supplies distributed">
          <table className="w-full text-left">
            <thead><tr className="text-[14px] text-muted"><th scope="col" className="pb-2 font-bold">Item</th><th scope="col" className="pb-2 font-bold">Given out</th><th scope="col" className="pb-2 font-bold">Left</th></tr></thead>
            <tbody>
              {r.supplies.map((s) => (
                <tr key={s.item} className="border-t border-line text-[16px]"><th scope="row" className="py-3.5 pr-3 font-bold">{s.item}</th><td className="pr-3">{s.given}</td><td>{s.left}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="mt-5 text-[14px] text-muted">Reports show only totals. No personal details are included.</p>
        </Card>
      </div>

      <section className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-white p-6">
        <div>
          <h2 className="font-display text-[24px] font-bold">Incident summary for partners</h2>
          <p className="mt-1 text-[16px] text-muted">One-page summary for the district office, with totals, gaps and volunteer hours.</p>
        </div>
        <a href={`/api/org/reports/export?period=${period === "today" ? "week" : period}&format=pdf&type=summary`} download className="rounded-lg bg-alert px-6 py-3.5 text-[16px] font-bold text-white hover:brightness-110">Generate report</a>
      </section>
    </OrgFrame>
  );
}
