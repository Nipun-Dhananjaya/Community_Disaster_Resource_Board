import { randomUUID } from "node:crypto";
import type { Role } from "../roles";
import type { Session } from "./session";

export interface AuditEntry { id: string; at: string; actor: string; role: Role | "unknown"; action: string; target: string; result: "done" | "blocked" }
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
    seedAudit(g.__cdrbData.audit);
  }
  return g.__cdrbData;
}

/** Append-only: there is no function to edit or delete an entry. Entries older than 12 months are dropped. */
export function audit(actor: { name: string; role: Role | "unknown" }, action: string, target: string, result: "done" | "blocked" = "done") {
  const list = store().audit;
  list.unshift({ id: randomUUID(), at: new Date().toISOString(), actor: actor.name, role: actor.role, action, target, result });
  const cutoff = Date.now() - 365 * 86_400_000;
  while (list.length > 5000 || (list.length && new Date(list[list.length - 1].at).getTime() < cutoff)) list.pop();
}
export const listAudit = () => store().audit;
export const recentSignIns = (name: string) =>
    store().audit.filter((e) => e.actor === name && /sign-in/i.test(e.action)).slice(0, 3);

export const listQueue = () => store().queue;
export function moderate(id: string, action: "approve" | "remove" | "review" | "edit", actor: Session, title?: string) {
  const q = store().queue;
  const i = q.findIndex((x) => x.id === id);
  if (i < 0) return { ok: false as const, error: "Item not found" };
  const item = q[i];
  if (action === "approve") { q.splice(i, 1); audit(actor, "Approved listing", item.title); }
  else if (action === "remove") { q.splice(i, 1); audit(actor, "Removed listing", item.title); }
  else if (action === "review") { item.status = "in_review"; audit(actor, "Started review", item.title); }
  else if (action === "edit" && title) { audit(actor, "Edited listing", `${item.title} → ${title}`); item.title = title; }
  return { ok: true as const };
}

export const listAlerts = () => store().alerts;
export function publishAlert(actor: Session, a: Omit<Alert, "id" | "publishedAt" | "by" | "near">) {
  const near = a.areas.split(/,| and /)[0].trim();
  const alert: Alert = { ...a, near, id: randomUUID(), publishedAt: new Date().toISOString(), by: actor.name };
  store().alerts.unshift(alert);
  audit(actor, "Published alert", `${a.title} (${a.severity})`);
  return alert;
}

export const getCapacity = (orgId: string): Capacity =>
    store().capacity.get(orgId) ?? { beds: 0, total: 50, status: "full", confirmedAt: Date.now() };
export function setCapacity(actor: Session, beds: number, status: Capacity["status"]) {
  const cur = getCapacity(actor.id);
  const next = { ...cur, beds, status, confirmedAt: Date.now() };
  store().capacity.set(actor.id, next);
  audit(actor, "Updated capacity", `${beds} of ${cur.total} beds free (${status})`);
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

export function addQueueItem(item: { title: string; note: string; kind: QueueItem["kind"] }) {
  store().queue.unshift({ id: randomUUID(), ...item, createdAt: Date.now(), status: "waiting" });
}

/* ---------- demo audit history (development only) ---------- */
function seedAudit(list: AuditEntry[]) {
  if (process.env.NODE_ENV === "production") return;
  const rows: [string, AuditEntry["role"], string, string, AuditEntry["result"]][] = [
    ["Kasun W.", "admin", "Published alert", "Kelani flooding, red warning", "done"],
    ["Dilini R.", "moderator", "Approved listing", "St. Mary’s Church Hall", "done"],
    ["Dilini R.", "moderator", "Removed listing", "Fuel, 200 litres (outdated)", "done"],
    ["Kasun W.", "admin", "Changed role", "User #2291 to Moderator", "done"],
    ["Unknown", "unknown", "Failed admin sign-in", "Admin console from new device", "blocked"],
    ["Ayesha M.", "moderator", "Suspended user", "User #1873, spam", "done"],
    ["Kasun W.", "admin", "Closed incident", "Landslide, Ratnapura", "done"],
    ["Dilini R.", "moderator", "Edited listing", "Central College Relief Centre", "done"],
  ];
  const base = [8, 19, 35, 52, 60, 88, 103, 130];
  for (let i = 0; i < 48; i++) {
    const [actor, role, action, target, result] = rows[i % 8];
    const mins = i < 8 ? base[i] : base[i % 8] + Math.floor(i / 8) * 1440 + (i % 5) * 37;
    list.push({ id: randomUUID(), at: new Date(Date.now() - mins * 60_000).toISOString(), actor, role, action, target, result });
  }
}

/* ---------- messages from the public: contact form and accessibility feedback ---------- */
export interface Inbound { id: string; kind: "contact" | "barrier"; topic: string; name: string; contact: string; org: string; message: string; at: number }
const gi = globalThis as unknown as { __cdrbInbox?: { items: Inbound[]; recent: Map<string, number[]> } };
function inbox() {
  if (!gi.__cdrbInbox) gi.__cdrbInbox = { items: [] as Inbound[], recent: new Map<string, number[]>() };
  return gi.__cdrbInbox;
}

/** Stores a message. Allows 5 per key per hour, so one person can't flood the inbox. */
export function addInbound(key: string, item: Omit<Inbound, "id" | "at">): { ok: true; ref: string } | { ok: false } {
  const box = inbox();
  const recent = (box.recent.get(key) ?? []).filter((t) => Date.now() - t < 3600_000);
  if (recent.length >= 5) return { ok: false };
  box.recent.set(key, [...recent, Date.now()]);
  const id = randomUUID();
  box.items.unshift({ ...item, id, at: Date.now() });
  box.items.splice(500);
  return { ok: true, ref: "MSG-" + id.replace(/-/g, "").slice(0, 6).toUpperCase() };
}
export const listInbound = () => inbox().items;
