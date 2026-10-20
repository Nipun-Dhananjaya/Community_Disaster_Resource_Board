import type { OrgStatus, Role } from "./roles";

export interface SessionUser { name: string; role: Role; orgStatus: OrgStatus }

const EVENT = "cdrb-auth";
let cache: SessionUser | null | undefined;

/** Asks the server who is signed in (the cookie is httpOnly, so JavaScript can't read it directly). */
export async function fetchMe(force = false): Promise<SessionUser | null> {
  if (!force && cache !== undefined) return cache;
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const data = (await res.json()) as { user: SessionUser | null };
    cache = data.user ?? null;
  } catch {
    cache = null;
  }
  return cache;
}
export function notifyAuthChange() {
  cache = undefined;
  window.dispatchEvent(new Event(EVENT));
}
export function onAuthChange(fn: () => void) {
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}
export async function logout() {
  try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
  notifyAuthChange();
}

/** Same-site paths only, and never back to the login pages. */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  if (next.startsWith("/login") || next.startsWith("/signup")) return null;
  return next;
}

/** Return people to the page they came from, unless that page is not for their role. */
export function pickDestination(next: string | null, role: Role, home: string): string {
  const n = safeNext(next);
  if (!n) return home;
  const privileged = role === "admin" || role === "moderator";
  if (n.startsWith("/admin") && !privileged) return home;
  if (n.startsWith("/org") && role !== "organization") return home;
  if (n.startsWith("/account") && role === "organization") return home;
  return n;
}

export async function postJson<T = Record<string, unknown>>(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  let data = {} as T;
  try { data = (await res.json()) as T; } catch {}
  return { ok: res.ok, status: res.status, data };
}
