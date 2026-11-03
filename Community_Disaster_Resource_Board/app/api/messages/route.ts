import { NextResponse } from "next/server";
import { ALL_ROLES, getApi } from "../../../lib/server/http";
import { listConversations } from "../../../lib/server/messages";

export const dynamic = "force-dynamic";

export async function GET() {
  const g = await getApi(ALL_ROLES);
  if ("response" in g) return g.response;
  return NextResponse.json({ conversations: listConversations(g.session) }, { headers: { "Cache-Control": "no-store" } });
}
