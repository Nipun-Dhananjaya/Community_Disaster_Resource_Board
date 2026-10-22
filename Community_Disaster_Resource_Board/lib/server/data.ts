import { randomUUID } from "node:crypto";
import type { Role } from "../roles";
import type { Session } from "./session";

export interface AuditEntry { id: string; at: string; actor: string; role: Role; action: string; target: string }
export interface QueueItem {
  id: string; title: string; note: string; kind: "verify_shelter" | "flagged" | "verify_team";
  createdAt: number; status: "waiting" | "in_review";
}
export type AlertKind = "official" | "road" | "weather" | "platform";
export interface Alert {
  id: string; title: string; areas: string; severity: "high" | "medium" | "low"; kind: AlertKind;
  body: string; source: string; near: string; publishedAt: string; by: string;
}
export interface Subscription { id: string; area: string; types: string[]; channels: string[]; phone?: string; email?: string; createdAt: number }
export interface Reservation { id: string; listingId: string; qty: number; phone: string; expiresAt: number }
export interface Capacity { beds: number; total: number; status: "available" | "limited" | "full"; confirmedAt: number }

type Store = { audit: AuditEntry[]; queue: QueueItem[]; alerts: Alert[]; capacity: Map<string, Capacity>; subs: Subscription[]; reservations: Reservation[] };
const g = globalThis as unknown as { __cdrbData?: Store };

function store(): Store {
  if (!g.__cdrbData) {
    const now = Date.now();
    g.__cdrbData = {
      audit: [],
      queue: [
        { id: "q1", title: "St. Mary’s Church Hall", note: "Registration document attached", kind: "verify_shelter", createdAt: now - 6 * 60_000, status: "waiting" },
        { id: "q2", title: "Fuel, 200 litres", note: "Reported as outdated", kind: "flagged", createdAt: now - 22 * 60_000, status: "waiting" },
        { id: "q3", title: "Rescue boat team", note: "New volunteer team", kind: "verify_team", createdAt: now - 41 * 60_000, status: "waiting" },
      ],
      alerts: [
        { id: "a1", title: "Red flood warning, Kelaniya", areas: "Kelaniya", severity: "high", kind: "official", body: "River level above danger mark. Evacuate low-lying areas near the bank.", source: "Disaster Management Centre", near: "Kelaniya", publishedAt: new Date(now - 35 * 60_000).toISOString(), by: "System" },
        { id: "a2", title: "Negombo-Colombo road closed at Ja-Ela", areas: "Ja-Ela", severity: "medium", kind: "road", body: "Use Katunayake road. Buses are diverted until further notice.", source: "Disaster Management Centre", near: "Ja-Ela", publishedAt: new Date(now - 60 * 60_000).toISOString(), by: "System" },
        { id: "a3", title: "Heavy rain expected tonight", areas: "Western Province", severity: "low", kind: "weather", body: "Up to 150 mm forecast in the Western Province until 6 am.", source: "Disaster Management Centre", near: "Colombo", publishedAt: new Date(now - 120 * 60_000).toISOString(), by: "System" },
        { id: "a4", title: "12 new shelters added in Gampaha", areas: "Gampaha", severity: "low", kind: "platform", body: "All listings checked by moderators in the last hour.", source: "Disaster Management Centre", near: "Gampaha", publishedAt: new Date(now - 180 * 60_000).toISOString(), by: "System" },
      ],
      subs: [],
      reservations: [],
      capacity: new Map([["u-org", { beds: 38, total: 120, status: "available", confirmedAt: now - 12 * 60_000 }]]),
    };
  }
  return g.__cdrbData;
}

export function audit(actor: Pick<Session, "name" | "role">, action: string, target: string) {
  store().audit.unshift({ id: randomUUID(), at: new Date().toISOString(), actor: actor.name, role: actor.role, action, target });
  store().audit.splice(500); // keep the last 500 entries in memory
}
export const listAudit = () => store().audit;

export const listQueue = () => store().queue;
export function moderate(id: string, action: "approve" | "remove" | "review" | "edit", actor: Session, title?: string) {
  const q = store().queue;
  const i = q.findIndex((x) => x.id === id);
  if (i < 0) return { ok: false as const, error: "Item not found" };
  const item = q[i];
  if (action === "approve") { q.splice(i, 1); audit(actor, "approved", item.title); }
  else if (action === "remove") { q.splice(i, 1); audit(actor, "removed", item.title); }
  else if (action === "review") { item.status = "in_review"; audit(actor, "started review of", item.title); }
  else if (action === "edit" && title) { audit(actor, `renamed "${item.title}" to`, title); item.title = title; }
  return { ok: true as const };
}

export const listAlerts = () => store().alerts;
export function publishAlert(actor: Session, a: Omit<Alert, "id" | "publishedAt" | "by" | "near">) {
  const near = a.areas.split(/,| and /)[0].trim();
  const alert: Alert = { ...a, near, id: randomUUID(), publishedAt: new Date().toISOString(), by: actor.name };
  store().alerts.unshift(alert);
  audit(actor, "published alert", `${a.title} (${a.severity})`);
  return alert;
}

export const getCapacity = (orgId: string): Capacity =>
    store().capacity.get(orgId) ?? { beds: 0, total: 50, status: "full", confirmedAt: Date.now() };
export function setCapacity(actor: Session, beds: number, status: Capacity["status"]) {
  const cur = getCapacity(actor.id);
  const next = { ...cur, beds, status, confirmedAt: Date.now() };
  store().capacity.set(actor.id, next);
  audit(actor, "updated capacity", `${beds} of ${cur.total} beds free (${status})`);
  return next;
}

/* ---------- alert subscriptions (stored only; sending needs an SMS/email provider) ---------- */
export function addSubscription(input: Omit<Subscription, "id" | "createdAt">) {
  const contact = (x: Pick<Subscription, "phone" | "email">) => `${x.phone ?? ""}|${x.email ?? ""}`;
  const existing = store().subs.find((x) => contact(x) === contact(input) && x.area.toLowerCase() === input.area.toLowerCase());
  if (existing) { Object.assign(existing, input); return existing; }
  const sub: Subscription = { ...input, id: randomUUID(), createdAt: Date.now() };
  store().subs.push(sub);
  return sub;
}

/* ---------- supply reservations (held for a while, then released) ---------- */
function liveReservations() {
  const now = Date.now();
  store().reservations = store().reservations.filter((r) => r.expiresAt > now);
  return store().reservations;
}
export const reservedFor = (listingId: string) => liveReservations().filter((r) => r.listingId === listingId).reduce((n, r) => n + r.qty, 0);
export const activeByPhone = (phone: string) => liveReservations().filter((r) => r.phone === phone).length;
export function addReservation(input: { listingId: string; qty: number; phone: string; holdHours: number }) {
  const r: Reservation = { id: randomUUID(), listingId: input.listingId, qty: input.qty, phone: input.phone, expiresAt: Date.now() + input.holdHours * 3600_000 };
  store().reservations.push(r);
  return r;
}
