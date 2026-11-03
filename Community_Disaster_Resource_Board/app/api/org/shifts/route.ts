import { NextResponse } from "next/server";
import { z } from "zod";
import { fail, guardApi, readJson } from "../../../../lib/server/http";
import { assignShift } from "../../../../lib/server/org";

const schema = z.object({
  week: z.number().int().min(-1).max(1), slot: z.enum(["morning", "afternoon", "night"]),
  day: z.number().int().min(0).max(6), volunteerId: z.string().min(1).max(40),
});

export async function POST(req: Request) {
  const g = await guardApi(req, ["organization"]);
  if ("response" in g) return g.response;
  if (g.session.orgStatus !== "approved") return fail(403, "Your organization hasn’t been approved yet");
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail(400, "Invalid request");
  const d = parsed.data;
  const r = assignShift(g.session.id, d.week, d.slot, d.day, d.volunteerId);
  return r.ok ? NextResponse.json({ ok: true }) : fail(r.status, r.error);
}
