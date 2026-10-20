import { NextResponse } from "next/server";
import { z } from "zod";
import { getCapacity, setCapacity } from "../../../../lib/server/data";
import { fail, guardApi, readJson } from "../../../../lib/server/http";

export async function POST(req: Request) {
  const g = await guardApi(req, ["organization"]);
  if ("response" in g) return g.response;
  if (g.session.orgStatus !== "approved") return fail(403, "Your organization hasn’t been approved yet");

  const total = getCapacity(g.session.id).total;
  const schema = z.object({
    beds: z.number().int().min(0).max(total, `Beds free can’t be more than ${total}`),
    status: z.enum(["available", "limited", "full"]),
  });
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail(400, parsed.error.issues[0]?.message ?? "Invalid request");
  const next = setCapacity(g.session, parsed.data.beds, parsed.data.status);
  return NextResponse.json({ ok: true, confirmedAt: next.confirmedAt });
}
