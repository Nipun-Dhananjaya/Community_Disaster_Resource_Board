import { NextResponse } from "next/server";
import { z } from "zod";
import { publishAlert } from "../../../../lib/server/data";
import { fail, guardApi, readJson } from "../../../../lib/server/http";
import { validate } from "../../../../lib/request-schema";

const schema = z.object({
  title: z.string().trim().min(5, "Enter a short title (at least 5 characters)").max(120, "Keep the title under 120 characters"),
  areas: z.string().trim().min(2, "Enter the affected areas").max(160, "Keep this under 160 characters"),
  severity: z.enum(["high", "medium", "low"], { message: "Choose a severity" }),
});

// Publishing alerts is admin-only. Moderators get a 403 even if they call this directly.
export async function POST(req: Request) {
  const g = await guardApi(req, ["admin"]);
  if ("response" in g) return g.response;
  const body = await readJson(req);
  const errors = validate(schema, body);
  if (Object.keys(errors).length) return fail(400, "Please check your answers", errors);
  return NextResponse.json({ ok: true, alert: publishAlert(g.session, schema.parse(body)) }, { status: 201 });
}
