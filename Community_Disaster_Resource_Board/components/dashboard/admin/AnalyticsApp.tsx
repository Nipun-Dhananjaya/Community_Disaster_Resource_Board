"use client";

import { useState } from "react";
import { analytics, Days } from "../../../lib/analytics-demo";
import { csvCell } from "../../../lib/reports-demo";
import { AdminFrame } from "../frames";
import { Badge, Card, StatCard } from "../ui";

function LineChart({ requests, fulfilled, days }: { requests: number[]; fulfilled: number[]; days: number }) {
  const W = 700, H = 240, padX = 4, padY = 14;
  const max = Math.max(...requests) * 1.08;
  const pts = (v: number[]) => v.map((y, i) => `${padX + (i / (v.length - 1)) * (W - padX * 2)},${H - padY - (y / max) * (H - padY * 2)}`).join(" ");
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Requests and fulfilled over the last ${days} days. Requests peaked at ${Math.max(...requests)} a day.`}>
        {[0, 1, 2, 3, 4].map((i) => <line key={i} x1="0" x2={W} y1={padY + (i * (H - padY * 2)) / 4} y2={padY + (i * (H - padY * 2)) / 4} stroke="#e6ecf1" strokeWidth="1" />)}
        <polyline points={pts(requests)} fill="none" stroke="#c5291f" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={pts(fulfilled)} fill="none" stroke="#1e8a5a" strokeWidth="3.5" strokeDasharray="9 7" strokeLinejoin="round" />
      </svg>
      <div className="mt-1 flex justify-between text-[13px] text-muted"><span>{days} days ago</span><span>Today</span></div>
      <table className="sr-only">
        <caption>Daily requests and fulfilled</caption>
        <thead><tr><th scope="col">Day</th><th scope="col">Requests</th><th scope="col">Fulfilled</th></tr></thead>
        <tbody>{requests.map((r, i) => <tr key={i}><th scope="row">{days - i - 1 === 0 ? "Today" : `${days - i - 1} days ago`}</th><td>{r}</td><td>{fulfilled[i]}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

function Donut({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="text-center">
      <svg viewBox="0 0 130 130" className="mx-auto size-[120px]" role="img" aria-label={`${label}: ${pct} percent`}>
        <circle cx="65" cy="65" r={r} fill="none" stroke="#e3e9ef" strokeWidth="12" />
        <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`} transform="rotate(-90 65 65)" />
        <text x="65" y="73" textAnchor="middle" className="fill-navy font-display text-[26px] font-bold">{pct}%</text>
      </svg>
      <p className="mt-2 text-[15px] font-bold">{label}</p>
    </div>
  );
}

const gap = {
  covered: { tone: "ok", text: "Covered" }, watch: { tone: "warn", text: "▲ Watch" }, transport: { tone: "alert", text: "▲ Short of transport" },
} as const;

export function AnalyticsApp() {
  const [days, setDays] = useState<Days>(14);
  const d = analytics[days];

  function exportCsv() {
    const rows: (string | number)[][] = [
      [`Analytics - last ${days} days`], [],
      ["Median response time", d.kpis.median.value], ["Fulfillment rate", d.kpis.rate.value], ["Requests received", d.kpis.received.value], ["Resources used", d.kpis.used.value], [],
      ["Day", "Requests", "Fulfilled"], ...d.requests.map((r, i) => [`${days - i - 1} days ago`, r, d.fulfilled[i]]), [],
      ["District", "Requests", "Median response", "Fulfilled %", "Gap"], ...d.districts.map((x) => [x.name, x.requests, x.response, x.fulfilled, gap[x.gap].text.replace("▲ ", "")]),
    ];
    const blob = new Blob([rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `analytics-${days}-days.csv`; a.click(); URL.revokeObjectURL(a.href);
  }

  const chip = (on: boolean) => `rounded-full border px-4 py-2 text-[15px] font-bold ${on ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-navy"}`;
  return (
    <AdminFrame
      role="admin" title="Analytics" subtitle={d.subtitle}
      actions={
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Time range">
          {([7, 14, 30] as Days[]).map((n) => <button key={n} type="button" aria-pressed={days === n} onClick={() => setDays(n)} className={chip(days === n)}>{n} days</button>)}
          <button type="button" onClick={exportCsv} className="rounded-lg border-2 border-navy px-4 py-2.5 text-[15px] font-bold hover:bg-navy hover:text-white">Export CSV</button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Median response time" value={d.kpis.median.value} valueClass="text-ok" note={d.kpis.median.note} />
        <StatCard label="Fulfillment rate" value={d.kpis.rate.value} valueClass="text-ok" note={d.kpis.rate.note} />
        <StatCard label="Requests received" value={d.kpis.received.value} note={d.kpis.received.note} />
        <StatCard label="Resources used" value={d.kpis.used.value} valueClass="text-[#8a4a0a]" note={d.kpis.used.note} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-[24px] font-bold">Requests and fulfilled</h2>
            <p className="flex items-center gap-4 text-[14px] font-bold">
              <span className="flex items-center gap-2"><span aria-hidden="true" className="h-[3px] w-6 bg-alert" />Requests</span>
              <span className="flex items-center gap-2"><span aria-hidden="true" className="h-[3px] w-6 border-t-[3px] border-dashed border-ok" />Fulfilled</span>
            </p>
          </div>
          <LineChart requests={d.requests} fulfilled={d.fulfilled} days={days} />
        </Card>
        <Card title="Outcome mix">
          <div className="grid grid-cols-3 gap-2">
            <Donut pct={d.outcome.fulfilled} color="#1e8a5a" label="Fulfilled" />
            <Donut pct={d.outcome.progress} color="#d8731f" label="In progress" />
            <Donut pct={d.outcome.unmatched} color="#c5291f" label="Unmatched" />
          </div>
        </Card>
      </div>

      <Card title="Busiest districts" className="mt-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead><tr className="text-[14px] text-muted">{["District", "Requests", "Median response", "Fulfilled", "Gap"].map((h) => <th key={h} scope="col" className="pb-2 font-bold">{h}</th>)}</tr></thead>
            <tbody>
              {d.districts.map((x) => (
                <tr key={x.name} className="border-t border-line text-[16px]">
                  <th scope="row" className="py-4 pr-3 font-bold">{x.name}</th><td className="pr-3">{x.requests}</td><td className="pr-3">{x.response}</td><td className="pr-3">{x.fulfilled}%</td>
                  <td><Badge tone={gap[x.gap].tone}>{gap[x.gap].text}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminFrame>
  );
}
