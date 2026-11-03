import { NextResponse } from "next/server";
import { z } from "zod";
import { ALL_ROLES, fail, guardApi, readJson } from "../../../../lib/server/http";
import { updatePrefs } from "../../../../lib/server/users";

const schema = z.object({
  alerts: z.boolean(), requestUpdates: z.boolean(), digest: z.boolean(),
  channels: z.array(z.enum(["sms", "app", "email"])).max(3),
  language: z.enum(["en", "si", "ta"]), lowBandwidth: z.boolean(), largerText: z.boolean(), hideProfile: z.boolean(),
}).partial().strict();

export async function POST(req: Request) {
  const g = await guardApi(req, ALL_ROLES);
  if ("response" in g) return g.response;
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail(400, "Invalid request");
  updatePrefs(g.session.id, parsed.data);
  return NextResponse.json({ ok: true });
}
