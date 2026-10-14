import { NextResponse } from "next/server";
import { fullSchema, validate } from "../../../lib/request-schema";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, errors: { form: "Invalid request" } }, { status: 400 });
  }

  const errors = validate(fullSchema, body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }
  const data = fullSchema.parse(body);

  // The client sends a clientId so a retry after a bad connection gives the same reference.
  const clientId = typeof body.clientId === "string" && body.clientId.length >= 6 ? body.clientId : crypto.randomUUID();
  const reference = "REQ-" + clientId.replace(/-/g, "").slice(0, 6).toUpperCase();

  // TODO: save `data` to your database here (and notify verified responders).
  // Avoid logging names or phone numbers.
  console.info("[request-help] received", reference, data.needs.join(","), data.urgency, data.area);

  return NextResponse.json({ ok: true, reference }, { status: 201 });
}
