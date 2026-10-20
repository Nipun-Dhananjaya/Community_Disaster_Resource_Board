import { NextResponse } from "next/server";
import type { Role } from "../roles";
import { getSession, type Session } from "./session";

/** Browsers always send Origin on POST. Rejecting other origins blocks cross-site request forgery. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

export const fail = (status: number, message: string, errors?: Record<string, string>) =>
  NextResponse.json({ ok: false, error: message, errors }, { status });

/** API routes: check origin, session and role on every call. */
export async function guardApi(req: Request, roles: Role[]): Promise<{ session: Session } | { response: NextResponse }> {
  if (!sameOrigin(req)) return { response: fail(403, "Cross-site request blocked") };
  const session = await getSession();
  if (!session) return { response: fail(401, "Please log in") };
  if (!roles.includes(session.role)) return { response: fail(403, "You don’t have access to this") };
  return { session };
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch { return null; }
}
