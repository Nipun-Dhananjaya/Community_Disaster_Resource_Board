import { NextResponse } from "next/server";
import { z } from "zod";
import { ALL_ROLES, fail, guardApi, readJson } from "../../../../lib/server/http";
import { removeUserFromConversations } from "../../../../lib/server/messages";
import { endSession } from "../../../../lib/server/session";
import { deleteUser, findById, noteFailure, tooManyAttempts, verifyLogin } from "../../../../lib/server/users";

export async function POST(req: Request) {
  const g = await guardApi(req, ALL_ROLES);
  if ("response" in g) return g.response;
  // Staff accounts carry audit history, so another admin must remove them.
  if (g.session.role === "admin" || g.session.role === "moderator") return fail(403, "Ask another admin to close a staff account");
  const parsed = z.object({ password: z.string().min(1).max(128) }).safeParse(await readJson(req));
  if (!parsed.success) return fail(400, "Enter your password to confirm");
  const user = findById(g.session.id);
  if (!user) return fail(404, "Account not found");
  const key = `del:${user.id}`;
  if (tooManyAttempts(key)) return fail(429, "Too many attempts. Please wait 10 minutes and try again.");
  if (!verifyLogin(user.identifier, parsed.data.password)) { noteFailure(key); return fail(400, "That password isn’t right"); }
  removeUserFromConversations(user.id);
  deleteUser(user.id);
  await endSession();
  return NextResponse.json({ ok: true });
}
