import { NextResponse } from "next/server";
import { z } from "zod";
import { homeFor } from "../../../../lib/roles";
import { fail, readJson, sameOrigin } from "../../../../lib/server/http";
import { startSession } from "../../../../lib/server/session";
import { createUser, findByIdentifier, isEmailOrPhone } from "../../../../lib/server/users";
import { validate } from "../../../../lib/request-schema";

// Only these roles can be chosen at sign-up. Admin and moderator accounts are never self-service.
const schema = z.object({
  role: z.enum(["individual", "volunteer", "organization"], { message: "Choose how you are registering" }),
  name: z.string().trim().min(2, "Enter your name").max(80, "Keep this under 80 characters"),
  identifier: z.string().trim().refine(isEmailOrPhone, "Enter a valid email address or phone number"),
  password: z.string().min(8, "Use at least 8 characters").max(128, "Use 128 characters or fewer"),
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Cross-site request blocked");
  const body = await readJson(req);
  if (!body) return fail(400, "Invalid request");
  const errors = validate(schema, body);
  if (Object.keys(errors).length) return fail(400, "Please check your answers", errors);
  const data = schema.parse(body);

  if (findByIdentifier(data.identifier)) {
    return fail(409, "Could not create the account", { identifier: "An account with this email or phone already exists. Try logging in." });
  }
  const user = createUser(data);
  await startSession(user, false);
  return NextResponse.json({ ok: true, role: user.role, home: homeFor(user.role) }, { status: 201 });
}
