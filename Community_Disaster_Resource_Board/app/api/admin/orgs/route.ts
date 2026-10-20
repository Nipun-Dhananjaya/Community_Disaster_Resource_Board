import { NextResponse } from "next/server";
import { z } from "zod";
import { audit } from "../../../../lib/server/data";
import { fail, guardApi, readJson } from "../../../../lib/server/http";
import { findById, setOrgStatus } from "../../../../lib/server/users";

const schema = z.object({ userId: z.string().min(1).max(64), decision: z.enum(["approve", "reject"]) });

export async function POST(req: Request) {
  const g = await guardApi(req, ["admin"]);
  if ("response" in g) return g.response;
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail(400, "Invalid request");
  const target = findById(parsed.data.userId);
  if (!target || target.role !== "organization") return fail(404, "Organization not found");
  setOrgStatus(target.id, parsed.data.decision === "approve" ? "approved" : "rejected");
  audit(g.session, parsed.data.decision === "approve" ? "approved organization" : "rejected organization", target.name);
  return NextResponse.json({ ok: true });
}
