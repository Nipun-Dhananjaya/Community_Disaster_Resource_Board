import { NextResponse } from "next/server";
import { homeFor, privilegedRoles } from "../../../../lib/roles";
import { fail, readJson, sameOrigin } from "../../../../lib/server/http";
import { startPending2fa, startSession } from "../../../../lib/server/session";
import { clearFailures, noteFailure, normalizeIdentifier, tooManyAttempts, verifyLogin } from "../../../../lib/server/users";
import { totp } from "../../../../lib/server/totp";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Cross-site request blocked");
  const body = await readJson(req);
  const identifier = typeof body?.identifier === "string" ? body.identifier : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!identifier || !password) return fail(400, "Enter your email or phone and password");

  const key = `login:${normalizeIdentifier(identifier)}`;
  if (tooManyAttempts(key)) return fail(429, "Too many attempts. Please wait 10 minutes and try again.");

  const user = verifyLogin(identifier, password);
  if (!user) {
    noteFailure(key);
    return fail(401, "That email, phone or password isn’t right"); // same message either way
  }
  clearFailures(key);

  if (privilegedRoles.includes(user.role)) {
    await startPending2fa(user);
    if (process.env.NODE_ENV !== "production" && user.totpSecret) {
      console.info(`[dev only] 2FA code for ${user.identifier}: ${totp(user.totpSecret)}`);
    }
    return NextResponse.json({ ok: true, step: "2fa" });
  }
  await startSession(user, false);
  return NextResponse.json({ ok: true, role: user.role, home: homeFor(user.role) });
}
