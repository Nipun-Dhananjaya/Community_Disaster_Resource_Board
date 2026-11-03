import { NextResponse } from "next/server";
import { z } from "zod";
import { validate } from "../../../lib/request-schema";
import { addInbound } from "../../../lib/server/data";
import { fail, readJson, sameOrigin } from "../../../lib/server/http";
import { isEmailOrPhone, normalizeIdentifier } from "../../../lib/server/users";

const schema = z.object({
  topic: z.enum(["question", "partner", "volunteering", "media", "feedback"], { message: "Choose what you are writing about" }),
  name: z.string().trim().min(2, "Enter your name").max(80, "Keep this under 80 characters"),
  contact: z.string().trim().refine(isEmailOrPhone, "Enter a valid email address or phone number"),
  organization: z.string().trim().max(120, "Keep this under 120 characters"),
  message: z.string().trim().min(10, "Write at least 10 characters").max(2000, "Keep the message under 2,000 characters"),
  website: z.string().max(200).optional(), // hidden field: real people leave it empty
});

// TODO: forward each message to your team's inbox (email service or helpdesk). For now it is only stored.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Cross-site request blocked");
  const body = await readJson(req);
  if (typeof body?.website === "string" && body.website.trim() !== "") return NextResponse.json({ ok: true, reference: "MSG-000000" }, { status: 201 }); // bots think it worked
  const errors = validate(schema, body);
  if (Object.keys(errors).length) return fail(400, "Please check your answers", errors);
  const d = schema.parse(body);
  const r = addInbound(`contact:${normalizeIdentifier(d.contact)}`, { kind: "contact", topic: d.topic, name: d.name, contact: d.contact, org: d.organization, message: d.message });
  if (!r.ok) return fail(429, "You’ve sent several messages already. Please wait an hour or call us instead.");
  return NextResponse.json({ ok: true, reference: r.ref }, { status: 201 });
}
