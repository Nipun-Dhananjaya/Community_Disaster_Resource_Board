import { NextResponse } from "next/server";
import { z } from "zod";
import { ALL_ROLES, fail, guardApi, readJson } from "../../../../lib/server/http";
import { changePassword, clearFailures, findById, noteFailure, tooManyAttempts, verifyLogin } from "../../../../lib/server/users";

const schema = z.object({ current: z.string().min(1).max(128), next: z.string().min(8, "Use at least 8 characters").max(128) });

export async function POST(req: Request) {
  const g = await guardApi(req, ALL_ROLES);
  if ("response" in g) return g.response;
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail(400, parsed.error.issues[0]?.message ?? "Invalid request");
  const user = findById(g.session.id);
  if (!user) return fail(404, "Account not found");

  const key = `pw:${user.id}`;
  if (tooManyAttempts(key)) return fail(429, "Too many attempts. Please wait 10 minutes and try again.");
  if (!verifyLogin(user.identifier, parsed.data.current)) { noteFailure(key); return fail(400, "Your current password isn’t right"); }
  if (parsed.data.next === parsed.data.current) return fail(400, "Choose a password you haven’t used just now");
  clearFailures(key);
  changePassword(user.id, parsed.data.next);
  return NextResponse.json({ ok: true });
}
