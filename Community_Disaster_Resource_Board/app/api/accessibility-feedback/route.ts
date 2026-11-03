import { NextResponse } from "next/server";
import { z } from "zod";
import { validate } from "../../../lib/request-schema";
import { addInbound } from "../../../lib/server/data";
import { fail, readJson, sameOrigin } from "../../../lib/server/http";
import { isEmailOrPhone, normalizeIdentifier } from "../../../lib/server/users";

const schema = z.object({
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(1500, "Keep this under 1,500 characters"),
  contact: z.string().trim().max(120).refine((v) => v === "" || isEmailOrPhone(v), "Enter a valid email address or phone number, or leave this empty"),
  website: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Cross-site request blocked");
  const body = await readJson(req);
  if (typeof body?.website === "string" && body.website.trim() !== "") return NextResponse.json({ ok: true }, { status: 201 });
  const errors = validate(schema, body);
  if (Object.keys(errors).length) return fail(400, "Please check your answers", errors);
  const d = schema.parse(body);
  const key = d.contact ? `barrier:${normalizeIdentifier(d.contact)}` : `barrier:anon:${req.headers.get("x-forwarded-for") ?? "local"}`;
  const r = addInbound(key, { kind: "barrier", topic: "accessibility", name: "", contact: d.contact, org: "", message: d.message });
  if (!r.ok) return fail(429, "You’ve sent several reports already. Please wait an hour.");
  return NextResponse.json({ ok: true }, { status: 201 });
}
