import { audit, listAudit } from "../../../../../lib/server/data";
import { filterAudit, parseQuery } from "../../../../../lib/audit-filter";
import { csvCell } from "../../../../../lib/reports-demo";
import { getApi } from "../../../../../lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = await getApi(["admin"]);
  if ("response" in g) return g.response;
  const url = new URL(req.url);
  const rows = filterAudit(listAudit(), parseQuery(Object.fromEntries(url.searchParams)));
  audit(g.session, "Exported audit log", `${rows.length} entries`);
  const csv = ["Time,Person,Role,Action,Target,Result", ...rows.map((e) => [e.at, e.actor, e.role, e.action, e.target, e.result].map(csvCell).join(","))].join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="audit-log.csv"', "Cache-Control": "no-store" } });
}
