import { randomUUID } from "node:crypto";
import type { Session } from "./session";
import { addQueueItem, audit } from "./data";
import { findById } from "./users";

export type Category = "requests" | "posts" | "support";
interface Msg { id: string; from: string; text: string; at: number; flagged?: boolean }
interface Note { by: string; text: string; at: number }
interface Conv {
  id: string; title: string; verified: boolean; category: Category;
  about?: { ref: string; text: string };
  fulfilled: boolean; participants: string[]; messages: Msg[]; unread: Record<string, number>;
  reported: boolean; escalated: boolean; notes: Note[];
}

type Db = { convs: Conv[]; sent: Map<string, number[]> };
const g = globalThis as unknown as { __cdrbMsgs?: Db };

const isStaff = (s: Pick<Session, "role">) => s.role === "moderator" || s.role === "admin";
const mins = (m: number) => Date.now() - m * 60_000;

function seed(db: Db) {
  if (process.env.NODE_ENV === "production") return;
  const me = "u-nimali";
  const m = (from: string, text: string, ago: number): Msg => ({ id: randomUUID(), from, text, at: mins(ago) });
  const base = { fulfilled: false, participants: [me], reported: false, escalated: false, notes: [] as Note[] };
  db.convs.push(
    {
      ...base, id: "c1", title: "Ms. Perera, Relief Centre", verified: true, category: "requests", about: { ref: "#HR-2041", text: "Shelter and food, 4 people" }, unread: { [me]: 2 },
      messages: [
        m(me, "Hello, my family of 4 needs shelter tonight.", 22),
        m("cp:perera", "We have space. Come to 14 College Road. Beds ready, bring ID if you can.", 14),
        m(me, "Thank you. We leave in 20 minutes.", 12),
      ],
    },
    { ...base, id: "c2", title: "Moderator team", verified: false, category: "support", unread: {}, messages: [m("staff:seed", "Your shelter listing was approved.", 60)] },
    { ...base, id: "c3", title: "Katunayake Youth Society", verified: true, category: "requests", about: { ref: "#RSV-3F2A", text: "Drinking water, 6 bottles" }, unread: {}, messages: [m("cp:youth", "Reservation held until 4 pm.", 26 * 60)] },
    { ...base, id: "c4", title: "Volunteer driver, Saman", verified: false, category: "requests", unread: {}, messages: [m("cp:saman", "I can collect you from Kelaniya.", 27 * 60)] },
  );
}

function db(): Db {
  if (!g.__cdrbMsgs) { g.__cdrbMsgs = { convs: [], sent: new Map() }; seed(g.__cdrbMsgs); }
  return g.__cdrbMsgs;
}

/** Regular users see their own conversations. Staff also see support threads and ones a user has reported. */
function canAccess(s: Session, c: Conv) {
  return c.participants.includes(s.id) || (isStaff(s) && (c.category === "support" || c.reported));
}
const find = (s: Session, id: string) => {
  const c = db().convs.find((x) => x.id === id);
  return c && canAccess(s, c) ? c : null;
};

/** Phone numbers stay hidden: long digit runs are replaced before a message is stored. */
export const maskPhones = (t: string) => t.replace(/\+?\d[\d\s-]{7,}\d/g, "[number hidden]");

function titleFor(s: Session, c: Conv) {
  if (isStaff(s) && !c.participants.includes(s.id)) {
    const who = findById(c.participants[0])?.name ?? "User";
    return `${c.category === "support" ? "Support" : "Reported"}: ${who}`;
  }
  return c.title;
}

function summary(s: Session, c: Conv) {
  const last = c.messages[c.messages.length - 1];
  return {
    id: c.id, title: titleFor(s, c), verified: c.verified, category: c.category,
    preview: last ? last.text.slice(0, 90) : "", at: last?.at ?? 0, unread: c.unread[s.id] ?? 0,
    reported: c.reported, escalated: c.escalated,
  };
}

export const listConversations = (s: Session) =>
  db().convs.filter((c) => canAccess(s, c)).map((c) => summary(s, c)).sort((a, b) => b.at - a.at);

export function getConversation(s: Session, id: string) {
  const c = find(s, id);
  if (!c) return null;
  if (c.unread[s.id]) c.unread[s.id] = 0;
  const staff = isStaff(s);
  return {
    ...summary(s, c),
    about: c.about ?? null, fulfilled: c.fulfilled, staff,
    messages: c.messages.map((x) => ({
      id: x.id, text: x.text, at: x.at, flagged: !!x.flagged,
      mine: x.from === s.id || (staff && x.from.startsWith("staff:")),
    })),
    notes: staff ? c.notes.map((n) => ({ by: n.by, text: n.text, at: n.at })) : [],
  };
}

export type Result = { ok: true } | { ok: false; status: number; error: string };
const no = (status: number, error: string): Result => ({ ok: false, status, error });

export function sendMessage(s: Session, id: string, raw: string): Result {
  const c = find(s, id);
  if (!c) return no(404, "Conversation not found");
  const text = maskPhones(raw.trim());
  if (!text) return no(400, "Write a message first");
  if (text.length > 1000) return no(400, "Keep messages under 1,000 characters");
  const recent = (db().sent.get(s.id) ?? []).filter((t) => Date.now() - t < 60_000);
  if (recent.length >= 20) return no(429, "You’re sending messages too quickly. Please wait a minute.");
  db().sent.set(s.id, [...recent, Date.now()]);

  const asStaff = isStaff(s) && !c.participants.includes(s.id);
  c.messages.push({ id: randomUUID(), from: asStaff ? `staff:${s.id}` : s.id, text, at: Date.now() });
  for (const p of c.participants) if (p !== s.id) c.unread[p] = (c.unread[p] ?? 0) + 1;
  return { ok: true };
}

export function markFulfilled(s: Session, id: string): Result {
  const c = find(s, id);
  if (!c || !c.participants.includes(s.id)) return no(404, "Conversation not found");
  if (c.category !== "requests" || !c.about) return no(400, "Nothing to mark as fulfilled here");
  c.fulfilled = true;
  return { ok: true };
}

export function reportConversation(s: Session, id: string): Result {
  const c = find(s, id);
  if (!c || !c.participants.includes(s.id)) return no(404, "Conversation not found");
  if (!c.reported) {
    c.reported = true;
    addQueueItem({ title: `Reported conversation: ${c.title}`, note: "Reported by a user. Staff can now read it.", kind: "flagged" });
  }
  return { ok: true };
}

export function staffAction(s: Session, id: string, action: "flag" | "escalate" | "note", extra?: { messageId?: string; text?: string }): Result {
  if (!isStaff(s)) return no(403, "Staff only");
  const c = find(s, id);
  if (!c) return no(404, "Conversation not found");
  if (action === "flag") {
    const msg = c.messages.find((x) => x.id === extra?.messageId);
    if (!msg) return no(404, "Message not found");
    msg.flagged = true;
    audit(s, "Flagged message", titleFor(s, c));
    addQueueItem({ title: `Flagged message in ${titleFor(s, c)}`, note: "Flagged by staff", kind: "flagged" });
  } else if (action === "escalate") {
    c.escalated = true;
    audit(s, "Escalated to coordinator", titleFor(s, c));
  } else {
    const text = (extra?.text ?? "").trim();
    if (!text || text.length > 500) return no(400, "Write a note (up to 500 characters)");
    c.notes.push({ by: s.name, text, at: Date.now() });
    audit(s, "Added internal note", titleFor(s, c));
  }
  return { ok: true };
}

export function exportFor(userId: string) {
  return db().convs.filter((c) => c.participants.includes(userId)).map((c) => ({
    title: c.title, category: c.category,
    messages: c.messages.map((m) => ({ at: new Date(m.at).toISOString(), from: m.from === userId ? "me" : "them", text: m.text })),
  }));
}
export function removeUserFromConversations(userId: string) {
  const d = db();
  d.convs = d.convs.filter((c) => !(c.participants.length === 1 && c.participants[0] === userId));
  for (const c of d.convs) c.participants = c.participants.filter((p) => p !== userId);
}
