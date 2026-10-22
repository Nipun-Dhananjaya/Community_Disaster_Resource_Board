import { NextResponse } from "next/server";
import { z } from "zod";
import { validate } from "../../../lib/request-schema";
import { addSubscription } from "../../../lib/server/data";
import { fail, readJson, sameOrigin } from "../../../lib/server/http";

const schema = z
  .object({
    area: z.string().trim().min(2, "Enter your town or area").max(80, "Keep this under 80 characters"),
    types: z.array(z.enum(["official", "road", "weather"])).min(1, "Choose at least one type of alert"),
    channels: z.array(z.enum(["sms", "email", "app"])).min(1, "Choose how to receive alerts"),
    phone: z.string().trim().max(30).optional(),
    email: z.string().trim().max(120).optional(),
  })
  .superRefine((d, ctx) => {
    if (d.channels.includes("sms")) {
      const digits = (d.phone ?? "").replace(/\D/g, "");
      if (!/^\+?[\d\s-]+$/.test(d.phone ?? "") || digits.length < 9 || digits.length > 15)
        ctx.addIssue({ code: "custom", path: ["phone"], message: "Enter a phone number with 9 to 15 digits" });
    }
    if (d.channels.includes("email") && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email ?? ""))
      ctx.addIssue({ code: "custom", path: ["email"], message: "Enter a valid email address" });
  });

// TODO: sending needs an SMS gateway / email service / push provider. This route only stores the request.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Cross-site request blocked");
  const body = await readJson(req);
  const errors = validate(schema, body);
  if (Object.keys(errors).length) return fail(400, "Please check your answers", errors);
  const d = schema.parse(body);
  addSubscription({
    area: d.area, types: d.types, channels: d.channels,
    phone: d.channels.includes("sms") ? d.phone?.replace(/[\s-]/g, "") : undefined,
    email: d.channels.includes("email") ? d.email?.toLowerCase() : undefined,
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
