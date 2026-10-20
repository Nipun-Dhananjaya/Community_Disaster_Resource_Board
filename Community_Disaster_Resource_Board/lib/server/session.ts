import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { privilegedRoles, type OrgStatus, type Role } from "../roles";
import { findById, type UserRecord } from "./users";

const SESSION = "cdrb_session";
const PENDING = "cdrb_2fa";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") throw new Error("Set SESSION_SECRET (at least 32 random characters) in production.");
  return "dev-only-secret-change-me-dev-only-secret";
}

function sign(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${mac}`;
}
function verify<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(mac), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try { return JSON.parse(Buffer.from(body, "base64url").toString()) as T; } catch { return null; }
}

const cookieOpts = (maxAge: number) => ({
  httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge,
});

type SessionPayload = { uid: string; exp: number; mfa: boolean };
type PendingPayload = { uid: string; exp: number };

export async function startSession(user: UserRecord, mfa: boolean) {
  const privileged = privilegedRoles.includes(user.role);
  const seconds = privileged ? 2 * 3600 : 8 * 3600; // admins get shorter sessions
  const store = await cookies();
  store.set(SESSION, sign({ uid: user.id, exp: Date.now() + seconds * 1000, mfa } satisfies SessionPayload), cookieOpts(seconds));
  store.delete(PENDING);
}
export async function endSession() {
  const store = await cookies();
  store.delete(SESSION);
  store.delete(PENDING);
}
export async function startPending2fa(user: UserRecord) {
  (await cookies()).set(PENDING, sign({ uid: user.id, exp: Date.now() + 5 * 60_000 } satisfies PendingPayload), cookieOpts(300));
}
export async function readPending2fa(): Promise<UserRecord | null> {
  const p = verify<PendingPayload>((await cookies()).get(PENDING)?.value);
  return p && p.exp > Date.now() ? findById(p.uid) : null;
}

export interface Session { id: string; name: string; role: Role; orgStatus: OrgStatus }

/** Reads the signed cookie, then looks the user up again, so role changes apply immediately. */
export async function getSession(): Promise<Session | null> {
  const p = verify<SessionPayload>((await cookies()).get(SESSION)?.value);
  if (!p || p.exp < Date.now()) return null;
  const user = findById(p.uid);
  if (!user) return null;
  if (privilegedRoles.includes(user.role) && !p.mfa) return null; // admins always need the second step
  return { id: user.id, name: user.name, role: user.role, orgStatus: user.orgStatus };
}
