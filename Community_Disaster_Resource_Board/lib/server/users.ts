import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import type { OrgStatus, Role } from "../roles";

export interface UserRecord {
  id: string;
  name: string;
  identifier: string; // lower-case email, or phone digits
  role: Role;
  orgStatus: OrgStatus;
  salt: string;
  hash: string;
  totpSecret?: string;
  createdAt: number;
}

type Db = { users: Map<string, UserRecord>; failures: Map<string, number[]> };
const g = globalThis as unknown as { __cdrbUsers?: Db };

const hashPassword = (password: string, salt: string) => scryptSync(password, salt, 64).toString("hex");

function make(id: string, name: string, identifier: string, password: string, role: Role, orgStatus: OrgStatus, totpSecret?: string): UserRecord {
  const salt = randomBytes(16).toString("hex");
  return { id, name, identifier, role, orgStatus, salt, hash: hashPassword(password, salt), totpSecret, createdAt: Date.now() };
}

/** Demo accounts exist in development only. In production, accounts must come from your real database. */
export const DEV_TOTP_SECRET = "JBSWY3DPEHPK3PXP";
function seed(db: Db) {
  if (process.env.NODE_ENV === "production") return;
  const list = [
    make("u-admin", "Site Admin", "admin@example.org", "Admin#2026demo", "admin", "none", DEV_TOTP_SECRET),
    make("u-mod", "Site Moderator", "mod@example.org", "Moderator#2026", "moderator", "none", DEV_TOTP_SECRET),
    make("u-org", "Central College Relief Centre", "org@example.org", "Org#2026demo", "organization", "approved"),
    make("u-org-pending", "Harbour Road Community Hall", "neworg@example.org", "Org#2026demo", "organization", "pending"),
    make("u-nimali", "Nimali Fernando", "nimali@example.org", "Nimali#2026", "individual", "none"),
    make("u-vol", "Kasun Silva", "volunteer@example.org", "Volunteer#2026", "volunteer", "none"),
  ];
  for (const u of list) db.users.set(u.id, u);
}

function db(): Db {
  if (!g.__cdrbUsers) {
    g.__cdrbUsers = { users: new Map(), failures: new Map() };
    seed(g.__cdrbUsers);
  }
  return g.__cdrbUsers;
}

export function normalizeIdentifier(raw: string): string {
  const t = raw.trim();
  return t.includes("@") ? t.toLowerCase() : t.replace(/[\s-]/g, "");
}
export function isEmailOrPhone(raw: string): boolean {
  const t = normalizeIdentifier(raw);
  if (t.includes("@")) return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t);
  return /^\+?\d{9,15}$/.test(t);
}

export const findById = (id: string) => db().users.get(id) ?? null;
export const findByIdentifier = (raw: string) => {
  const key = normalizeIdentifier(raw);
  for (const u of db().users.values()) if (u.identifier === key) return u;
  return null;
};
export const listUsers = () => [...db().users.values()];

export function createUser(input: { name: string; identifier: string; password: string; role: "individual" | "volunteer" | "organization" }) {
  const user = make(randomUUID(), input.name.trim(), normalizeIdentifier(input.identifier), input.password, input.role, input.role === "organization" ? "pending" : "none");
  db().users.set(user.id, user);
  return user;
}

export function setOrgStatus(id: string, status: OrgStatus) {
  const u = findById(id);
  if (u && u.role === "organization") u.orgStatus = status;
  return u;
}

const DUMMY = make("dummy", "", "", "dummy-password", "individual", "none");

/** Checks the password in constant time, even when the account doesn't exist. */
export function verifyLogin(raw: string, password: string): UserRecord | null {
  const user = findByIdentifier(raw);
  const target = user ?? DUMMY;
  const a = Buffer.from(hashPassword(password, target.salt), "hex");
  const b = Buffer.from(target.hash, "hex");
  const ok = a.length === b.length && timingSafeEqual(a, b);
  return user && ok ? user : null;
}

/* Simple brute-force protection: 5 failures per 10 minutes per key. */
const WINDOW = 10 * 60_000;
export function tooManyAttempts(key: string): boolean {
  const recent = (db().failures.get(key) ?? []).filter((t) => Date.now() - t < WINDOW);
  db().failures.set(key, recent);
  return recent.length >= 5;
}
export function noteFailure(key: string) {
  db().failures.set(key, [...(db().failures.get(key) ?? []), Date.now()]);
}
export function clearFailures(key: string) {
  db().failures.delete(key);
}
