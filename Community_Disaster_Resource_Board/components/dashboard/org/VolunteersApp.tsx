"use client";

import { useMemo, useState } from "react";
import { postJson } from "../../../lib/client-auth";
import { days, needsCover, slotLabel, slots, weekStats, type Grid, type Slot } from "../../../lib/shifts";
import { OrgFrame } from "../frames";
import { Badge, Card, StatCard } from "../ui";

export interface RosterVol { id: string; name: string; skills: string; tags: string[]; next: string; status: "on_shift" | "confirm" | "off_duty" | "invited" }
interface Target { slot: Slot; day: number }

const statusUi = {
  on_shift: { tone: "ok", text: "● On shift" }, confirm: { tone: "warn", text: "▲ Confirm" },
  off_duty: { tone: "neutral", text: "■ Off duty" }, invited: { tone: "neutral", text: "Invited" },
} as const;
const filters = [["all", "All"], ["medical", "Medical"], ["driving", "Driving"], ["cooking", "Cooking"], ["translation", "Translation"]] as const;

function cellLook(filled: number, needed: number) {
  if (filled >= needed) return { cls: "bg-[#d7efe3] text-ok", mark: "✓ " };
  if (needsCover({ filled, needed, assigned: [] }) && filled / needed < 0.4) return { cls: "bg-[#f8d4cf] text-[#9a1c14]", mark: "▲ " };
  return { cls: "bg-[#fbe9c8] text-[#8a4a0a]", mark: "▲ " };
}

export function VolunteersApp({ orgName, weeks: initialWeeks, roster: initialRoster }: { orgName: string; weeks: Record<string, Grid>; roster: RosterVol[] }) {
  const [weeks, setWeeks] = useState(initialWeeks);
  const [roster, setRoster] = useState(initialRoster);
  const [week, setWeek] = useState(0);
  const [filter, setFilter] = useState<(typeof filters)[number][0]>("all");
  const [volId, setVolId] = useState("");
  const [target, setTarget] = useState<Target | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inv, setInv] = useState({ name: "", skills: "" });
  const [invErr, setInvErr] = useState<Record<string, string>>({});

  const grid = weeks[String(week)];
  const stats = useMemo(() => weekStats(weeks["0"]), [weeks]);
  const open = useMemo(() => slots.flatMap((s) => grid[s].map((c, d) => ({ s, d, c }))).filter((x) => x.c.filled < x.c.needed), [grid]);
  const weekLabel = week === 0 ? "This week" : week < 0 ? "Last week" : "Next week";
  const shown = roster.filter((v) => filter === "all" || v.tags.includes(filter));

  async function assign() {
    if (!target || !volId) { setMsg({ ok: false, text: "Choose a volunteer and a shift." }); return; }
    const r = await postJson<{ error?: string }>("/api/org/shifts", { week, slot: target.slot, day: target.day, volunteerId: volId });
    if (!r.ok) { setMsg({ ok: false, text: r.data.error ?? "Couldn’t assign." }); return; }
    const name = roster.find((v) => v.id === volId)?.name ?? "Volunteer";
    setWeeks((w) => {
      const g = structuredClone(w[String(week)]);
      g[target.slot][target.day].filled += 1; g[target.slot][target.day].assigned.push(volId);
      return { ...w, [String(week)]: g };
    });
    setRoster((rs) => rs.map((v) => (v.id === volId ? { ...v, next: `${days[target.day]} ${target.slot}` } : v)));
    setMsg({ ok: true, text: `${name} is on ${days[target.day]} ${target.slot}.` });
    setTarget(null);
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault(); setInvErr({});
    const r = await postJson<{ errors?: Record<string, string>; error?: string; volunteer?: RosterVol }>("/api/org/volunteers", inv);
    if (r.ok && r.data.volunteer) { setRoster((x) => [...x, r.data.volunteer!]); setInv({ name: "", skills: "" }); setInviteOpen(false); setMsg({ ok: true, text: "Added to the roster as Invited. Ask them to register as a Volunteer so they can accept." }); }
    else setInvErr(r.data.errors ?? { name: r.data.error ?? "Couldn’t add them." });
  }

  const chip = (on: boolean) => `rounded-full border px-4 py-1.5 text-[14px] font-bold ${on ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-navy"}`;
  return (
    <OrgFrame
      title="Volunteers" subtitle={`${orgName} · roster, shifts and assignments`}
      actions={<button type="button" onClick={() => setInviteOpen((v) => !v)} aria-expanded={inviteOpen} className="rounded-lg bg-alert px-6 py-3.5 text-[16px] font-bold text-white hover:brightness-110">+ Invite volunteer</button>}
    >
      {inviteOpen && (
        <form noValidate onSubmit={invite} className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-white p-5">
          <div className="min-w-[200px] flex-1">
            <label htmlFor="iv-name" className="text-[15px] font-bold">Name</label>
            <input id="iv-name" value={inv.name} onChange={(e) => setInv({ ...inv, name: e.target.value })} aria-invalid={!!invErr.name} className="mt-1 w-full rounded-lg border border-[#b9c6d3] px-3 py-2.5 text-[16px]" />
            {invErr.name && <p role="alert" className="mt-1 text-[14px] font-bold text-alert">{invErr.name}</p>}
          </div>
          <div className="min-w-[200px] flex-1">
            <label htmlFor="iv-skills" className="text-[15px] font-bold">Skills <span className="font-normal text-muted">(optional)</span></label>
            <input id="iv-skills" value={inv.skills} onChange={(e) => setInv({ ...inv, skills: e.target.value })} placeholder="Driving, first aid" className="mt-1 w-full rounded-lg border border-[#b9c6d3] px-3 py-2.5 text-[16px]" />
          </div>
          <button type="submit" className="rounded-lg bg-navy px-5 py-3 text-[15px] font-bold text-white">Add to roster</button>
        </form>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="On shift now" value={12} note="of 14 expected" />
        <StatCard label="Registered" value={46 + roster.filter((v) => v.status === "invited").length} note="5 new this week" />
        <StatCard label="Unfilled shifts" value={stats.unfilled} valueClass="text-[#9a1c14]" note={stats.note} />
        <StatCard label="Hours this week" value={318} valueClass="text-ok" note="↑ 12%" />
      </div>

      <Card className="mt-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[24px] font-bold">Shift schedule</h2>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Previous week" disabled={week <= -1} onClick={() => setWeek(week - 1)} className="size-9 rounded-full border border-line font-bold disabled:opacity-40">‹</button>
            <span className="rounded-full bg-navy px-4 py-1.5 text-[14px] font-bold text-white" aria-live="polite">{weekLabel}</span>
            <button type="button" aria-label="Next week" disabled={week >= 1} onClick={() => setWeek(week + 1)} className="size-9 rounded-full border border-line font-bold disabled:opacity-40">›</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-x-2 border-spacing-y-2 text-center">
            <thead><tr><th scope="col" className="w-[90px]"><span className="sr-only">Shift</span></th>{days.map((d) => <th key={d} scope="col" className="pb-1 text-[14px] font-semibold text-muted">{d}</th>)}</tr></thead>
            <tbody>
              {slots.map((s) => (
                <tr key={s}>
                  <th scope="row" className="text-left text-[15px] font-bold">{slotLabel[s]}</th>
                  {grid[s].map((c, d) => {
                    const look = cellLook(c.filled, c.needed);
                    const full = c.filled >= c.needed;
                    const on = target?.slot === s && target.day === d;
                    return (
                      <td key={d}>
                        <button type="button" disabled={full}
                          aria-label={`${days[d]} ${s}: ${c.filled} of ${c.needed} filled${full ? "" : ". Choose to assign someone"}`}
                          onClick={() => { setTarget({ slot: s, day: d }); setPanelOpen(true); setMsg(null); }}
                          className={`w-full rounded-lg px-1 py-3.5 text-[15px] font-bold ${look.cls} ${on ? "ring-2 ring-navy" : ""} ${full ? "cursor-default" : "hover:brightness-95"}`}>
                          {look.mark}{c.filled}/{c.needed}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {panelOpen && (
          <div className="mt-4 flex flex-wrap items-end gap-3 rounded-lg bg-canvas p-4">
            <div>
              <label htmlFor="as-vol" className="text-[14px] font-bold">Volunteer</label>
              <select id="as-vol" value={volId} onChange={(e) => setVolId(e.target.value)} className="mt-1 block rounded-lg border border-[#b9c6d3] bg-white px-3 py-2.5 text-[15px]">
                <option value="">Choose…</option>
                {roster.filter((v) => v.status !== "invited").map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="as-shift" className="text-[14px] font-bold">Shift ({weekLabel.toLowerCase()})</label>
              <select id="as-shift" value={target ? `${target.slot}-${target.day}` : ""} onChange={(e) => { const [s, d] = e.target.value.split("-"); setTarget(s ? { slot: s as Slot, day: Number(d) } : null); }} className="mt-1 block rounded-lg border border-[#b9c6d3] bg-white px-3 py-2.5 text-[15px]">
                <option value="">Choose…</option>
                {open.map((x) => <option key={`${x.s}-${x.d}`} value={`${x.s}-${x.d}`}>{days[x.d]} {x.s} ({x.c.filled}/{x.c.needed})</option>)}
              </select>
            </div>
            <button type="button" onClick={assign} className="rounded-lg bg-navy px-5 py-3 text-[15px] font-bold text-white">Assign</button>
            <button type="button" onClick={() => { setPanelOpen(false); setTarget(null); }} className="px-2 py-3 text-[15px] font-bold underline underline-offset-2">Close</button>
          </div>
        )}
        <p role="status" className={`mt-3 min-h-[20px] text-[14px] font-bold ${msg ? (msg.ok ? "text-ok" : "text-alert") : ""}`}>{msg?.text}</p>
      </Card>

      <Card className="mt-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[24px] font-bold">Roster</h2>
          <div role="group" aria-label="Filter by skill" className="flex flex-wrap gap-2">
            {filters.map(([k, l]) => <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} className={chip(filter === k)}>{l}</button>)}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead><tr className="text-[14px] text-muted">{["Volunteer", "Skills", "Next shift", "Status"].map((h) => <th key={h} scope="col" className="pb-2 font-bold">{h}</th>)}<th scope="col" className="pb-2"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {shown.map((v) => (
                <tr key={v.id} className="border-t border-line text-[16px]">
                  <th scope="row" className="py-4 pr-3 font-bold">{v.name}</th><td className="pr-3">{v.skills}</td><td className="pr-3">{v.next}</td>
                  <td className="pr-3"><Badge tone={statusUi[v.status].tone}>{statusUi[v.status].text}</Badge></td>
                  <td>
                    <button type="button" disabled={v.status === "invited"} onClick={() => { setVolId(v.id); setPanelOpen(true); setMsg(null); }}
                      className="rounded-lg border-2 border-navy px-4 py-2 text-[15px] font-bold hover:bg-navy hover:text-white disabled:opacity-50">Assign</button>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={5} className="py-6 text-[15px] text-muted">No volunteers with that skill yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </OrgFrame>
  );
}
