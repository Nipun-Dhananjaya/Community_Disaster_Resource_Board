import { ALL_ROLES, fail, getApi } from "../../../../lib/server/http";
import { exportFor } from "../../../../lib/server/messages";
import { findById } from "../../../../lib/server/users";

export const dynamic = "force-dynamic";

export async function GET() {
  const g = await getApi(ALL_ROLES);
  if ("response" in g) return g.response;
  const u = findById(g.session.id);
  if (!u) return fail(404, "Account not found");
  const data = {
    exportedAt: new Date().toISOString(),
    profile: { name: u.name, role: u.role, email: u.email ?? null, phone: u.phone ?? null, homeArea: u.homeArea ?? null, createdAt: new Date(u.createdAt).toISOString() },
    preferences: u.prefs,
    conversations: exportFor(u.id),
  };
  return new Response(JSON.stringify(data, null, 2), {
    headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="my-data.json"', "Cache-Control": "no-store" },
  });
}
