import { days, needsCover, slots, weekStats, type Cell, type Grid, type Slot } from "../shifts";
export { days, needsCover, slots, weekStats };
export type { Cell, Grid, Slot };

export interface Vol { id: string; name: string; skills: string; tags: string[]; next: string; status: "on_shift" | "confirm" | "off_duty" | "invited" }

const baseFilled: Record<Slot, number[]> = { morning: [6, 6, 5, 6, 4, 3, 2], afternoon: [8, 7, 8, 5, 6, 4, 4], night: [3, 2, 2, 3, 1, 2, 1] };
const needed: Record<Slot, number> = { morning: 6, afternoon: 8, night: 4 };

type OrgData = { roster: Vol[]; weeks: Map<number, Record<Slot, Cell[]>> };
const g = globalThis as unknown as { __cdrbOrg?: Map<string, OrgData> };

function build(week: number): Record<Slot, Cell[]> {
  const out = {} as Record<Slot, Cell[]>;
  for (const s of slots) {
    out[s] = baseFilled[s].map((f) => {
      const n = needed[s];
      const filled = week < 0 ? n : week > 0 ? Math.max(0, f - 2) : f;
      return { filled, needed: n, assigned: [] };
    });
  }
  return out;
}

export function getOrgData(orgId: string): OrgData {
  g.__cdrbOrg ??= new Map();
  let d = g.__cdrbOrg.get(orgId);
  if (!d) {
    d = {
      roster: [
        { id: "v1", name: "Saman P.", skills: "Driving, first aid", tags: ["driving", "medical"], next: "Today 6 pm", status: "on_shift" },
        { id: "v2", name: "Ayesha M.", skills: "Medical, Tamil", tags: ["medical", "translation"], next: "Tomorrow 8 am", status: "confirm" },
        { id: "v3", name: "Dinesh K.", skills: "Cooking", tags: ["cooking"], next: "Fri 2 pm", status: "off_duty" },
      ],
      weeks: new Map(),
    };
    g.__cdrbOrg.set(orgId, d);
  }
  return d;
}

export function getWeek(orgId: string, week: number) {
  const d = getOrgData(orgId);
  if (!d.weeks.has(week)) d.weeks.set(week, build(week));
  return d.weeks.get(week)!;
}

export function assignShift(orgId: string, week: number, slot: Slot, day: number, volId: string): { ok: true } | { ok: false; status: number; error: string } {
  if (week < -1 || week > 1) return { ok: false, status: 400, error: "Choose a week from last week to next week" };
  const d = getOrgData(orgId);
  const vol = d.roster.find((v) => v.id === volId);
  if (!vol) return { ok: false, status: 404, error: "Volunteer not found" };
  if (vol.status === "invited") return { ok: false, status: 400, error: "This volunteer hasn’t accepted the invitation yet" };
  const cell = getWeek(orgId, week)[slot][day];
  if (!cell) return { ok: false, status: 400, error: "Shift not found" };
  if (cell.filled >= cell.needed) return { ok: false, status: 400, error: "That shift is already full" };
  if (cell.assigned.includes(vol.id)) return { ok: false, status: 400, error: `${vol.name} is already on that shift` };
  cell.filled += 1;
  cell.assigned.push(vol.id);
  vol.next = `${days[day]} ${slot}`;
  return { ok: true };
}

export function inviteVolunteer(orgId: string, name: string, skills: string) {
  const d = getOrgData(orgId);
  const v: Vol = { id: `v${Date.now().toString(36)}`, name, skills: skills || "Not given", tags: [], next: "Not scheduled", status: "invited" };
  d.roster.push(v);
  return v;
}
