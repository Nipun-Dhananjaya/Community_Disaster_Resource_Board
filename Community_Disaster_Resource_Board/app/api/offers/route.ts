import { NextResponse } from "next/server";
import { offerSchema } from "../../../lib/offer-config";
import { validate } from "../../../lib/request-schema";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, errors: { form: "Invalid request" } }, { status: 400 });
  }

  const errors = validate(offerSchema, body);
  if (Object.keys(errors).length > 0) return NextResponse.json({ ok: false, errors }, { status: 400 });
  const data = offerSchema.parse(body);

  // TODO: check the signed-in user here (return 401 if missing), then save `data` as "pending"
  // so moderators can approve it. Avoid logging contact details.
  const clientId = typeof body.clientId === "string" && body.clientId.length >= 6 ? body.clientId : crypto.randomUUID();
  const reference = "OFR-" + clientId.replace(/-/g, "").slice(0, 6).toUpperCase();
  console.info("[offer-help] received", reference, data.offer);

  return NextResponse.json({ ok: true, reference, status: "pending" }, { status: 201 });
}
