import { NextResponse } from "next/server";
import { z } from "zod";
import { validate } from "../../../../lib/request-schema";
import { fail, guardApi, readJson } from "../../../../lib/server/http";
import { inviteVolunteer } from "../../../../lib/server/org";

const schema = z.object({
  name: z.string().trim().min(2, "Enter their name").max(60, "Keep this under 60 characters"),
  skills: z.string().trim().max(80, "Keep this under 80 characters"),
});

// TODO: sending the invitation needs an email or SMS provider. This only adds them to the roster as "Invited".
export async function POST(req: Request) {
  const g = await guardApi(req, ["organization"]);
  if ("response" in g) return g.response;
  if (g.session.orgStatus !== "approved") return fail(403, "Your organization hasn’t been approved yet");
  const body = await readJson(req);
  const errors = validate(schema, body);
  if (Object.keys(errors).length) return fail(400, "Please check your answers", errors);
  const d = schema.parse(body);
  return NextResponse.json({ ok: true, volunteer: inviteVolunteer(g.session.id, d.name, d.skills) }, { status: 201 });
}
