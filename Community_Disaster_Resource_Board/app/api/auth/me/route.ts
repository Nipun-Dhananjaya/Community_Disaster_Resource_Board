import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/server/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await getSession();
  // Only what the header needs. No email, phone or id.
  return NextResponse.json({ user: s ? { name: s.name, role: s.role, orgStatus: s.orgStatus } : null }, { headers: { "Cache-Control": "no-store" } });
}
