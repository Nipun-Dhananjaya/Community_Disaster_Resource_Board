import { NextResponse } from "next/server";
import { z } from "zod";
import { validate } from "../../../../lib/request-schema";
import { ALL_ROLES, fail, guardApi, readJson } from "../../../../lib/server/http";
import { updateProfile } from "../../../../lib/server/users";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80, "Keep this under 80 characters"),
  phone: z.string().trim().refine((v) => v === "" || (/^\+?[\d\s-]+$/.test(v) && v.replace(/\D/g, "").length >= 9 && v.replace(/\D/g, "").length <= 15), "Enter a phone number with 9 to 15 digits"),
  email: z.string().trim().max(120).refine((v) => v === "" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "Enter a valid email address"),
  homeArea: z.string().trim().max(80, "Keep this under 80 characters"),
});

export async function POST(req: Request) {
  const g = await guardApi(req, ALL_ROLES);
  if ("response" in g) return g.response;
  const body = await readJson(req);
  const errors = validate(schema, body);
  if (Object.keys(errors).length) return fail(400, "Please check your answers", errors);
  updateProfile(g.session.id, schema.parse(body));
  return NextResponse.json({ ok: true });
}
