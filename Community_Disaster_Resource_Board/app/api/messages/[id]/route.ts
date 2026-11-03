import { NextResponse } from "next/server";
import { z } from "zod";
import { ALL_ROLES, fail, getApi, guardApi, readJson } from "../../../../lib/server/http";
import { getConversation, markFulfilled, reportConversation, sendMessage, staffAction } from "../../../../lib/server/messages";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await getApi(ALL_ROLES);
  if ("response" in g) return g.response;
  const conv = getConversation(g.session, (await params).id);
  return conv ? NextResponse.json({ conversation: conv }, { headers: { "Cache-Control": "no-store" } }) : fail(404, "Conversation not found");
}

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("send"), text: z.string().max(2000) }),
  z.object({ action: z.literal("fulfill") }),
  z.object({ action: z.literal("report") }),
  z.object({ action: z.literal("flag"), messageId: z.string().max(64) }),
  z.object({ action: z.literal("escalate") }),
  z.object({ action: z.literal("note"), text: z.string().max(600) }),
]);

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guardApi(req, ALL_ROLES);
  if ("response" in g) return g.response;
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail(400, "Invalid request");
  const id = (await params).id, s = g.session, d = parsed.data;
  const r =
    d.action === "send" ? sendMessage(s, id, d.text)
    : d.action === "fulfill" ? markFulfilled(s, id)
    : d.action === "report" ? reportConversation(s, id)
    : d.action === "flag" ? staffAction(s, id, "flag", { messageId: d.messageId })
    : d.action === "escalate" ? staffAction(s, id, "escalate")
    : staffAction(s, id, "note", { text: d.text });
  return r.ok ? NextResponse.json({ ok: true }) : fail(r.status, r.error);
}
