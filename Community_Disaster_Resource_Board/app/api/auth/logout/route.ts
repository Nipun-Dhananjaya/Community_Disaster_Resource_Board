import { NextResponse } from "next/server";
import { fail, sameOrigin } from "../../../../lib/server/http";
import { endSession } from "../../../../lib/server/session";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Cross-site request blocked");
  await endSession();
  return NextResponse.json({ ok: true });
}
