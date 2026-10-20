import { NextResponse } from "next/server";
import { homeFor } from "../../../../lib/roles";
import { audit } from "../../../../lib/server/data";
import { fail, readJson, sameOrigin } from "../../../../lib/server/http";
import { readPending2fa, startSession } from "../../../../lib/server/session";
import { clearFailures, noteFailure, tooManyAttempts } from "../../../../lib/server/users";
import { verifyTotp } from "../../../../lib/server/totp";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Cross-site request blocked");
  const user = await readPending2fa();
  if (!user || !user.totpSecret) return fail(401, "Your login timed out. Please start again.");

  const key = `2fa:${user.id}`;
  if (tooManyAttempts(key)) return fail(429, "Too many attempts. Please wait 10 minutes and try again.");

  const body = await readJson(req);
  const code = typeof body?.code === "string" ? body.code : "";
  if (!verifyTotp(user.totpSecret, code)) {
    noteFailure(key);
    return fail(401, "That code isn’t right. Check your authenticator app.");
  }
  clearFailures(key);
  await startSession(user, true);
  audit({ name: user.name, role: user.role }, "signed in", "admin console");
  return NextResponse.json({ ok: true, role: user.role, home: homeFor(user.role) });
}
