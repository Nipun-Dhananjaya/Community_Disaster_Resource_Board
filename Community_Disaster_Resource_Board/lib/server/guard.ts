import { notFound, redirect } from "next/navigation";
import type { Role } from "../roles";
import { getSession, type Session } from "./session";

/** Pages: send signed-out visitors to the login page, and come back afterwards. */
export async function requireSession(nextPath: string): Promise<Session> {
  const s = await getSession();
  if (!s) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return s;
}

/** Pages: signed-in people with the wrong role get a plain "not found", so protected areas stay hidden. */
export async function requireRole(roles: Role[], nextPath: string): Promise<Session> {
  const s = await requireSession(nextPath);
  if (!roles.includes(s.role)) notFound();
  return s;
}
