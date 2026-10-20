import { NextResponse } from "next/server";
import { z } from "zod";
import { moderate } from "../../../../lib/server/data";
import { fail, guardApi, readJson } from "../../../../lib/server/http";

const schema = z.object({
  id: z.string().min(1).max(64),
  action: z.enum(["approve", "remove", "review", "edit"]),
  title: z.string().trim().min(2).max(120).optional(),
});

export async function POST(req: Request) {
  const g = await guardApi(req, ["admin", "moderator"]);
  if ("response" in g) return g.response;
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail(400, "Invalid request");
  if (parsed.data.action === "edit" && !parsed.data.title) return fail(400, "Enter a new title");
  const r = moderate(parsed.data.id, parsed.data.action, g.session, parsed.data.title);
  return r.ok ? NextResponse.json({ ok: true }) : fail(404, r.error);
}
