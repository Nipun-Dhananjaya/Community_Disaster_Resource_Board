import Link from "next/link";
import { AdminFrame } from "../frames";
import { Badge, Card } from "../ui";
import { AuditFilters } from "./AuditFilters";
import { PAGE_SIZE, filterAudit, parseQuery } from "../../../lib/audit-filter";
import { listAudit } from "../../../lib/server/data";

const roleBadge = (r: string) =>
  r === "admin" ? <span className="rounded-full bg-navy px-2.5 py-0.5 text-[13px] font-bold text-white">Admin</span>
  : r === "moderator" ? <Badge tone="ok">Moderator</Badge> : <Badge tone="alert">–</Badge>;

export function AuditView({ sp }: { sp: Record<string, string | string[] | undefined> }) {
  const q = parseQuery(sp);
  const all = listAudit();
  const rows = filterAudit(all, q);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(q.page, pages);
  const slice = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const actions = [...new Set(all.map((e) => e.action))].sort();

  const href = (p: number) => {
    const u = new URLSearchParams();
    if (q.q) u.set("q", q.q); if (q.role !== "all") u.set("role", q.role); if (q.action !== "all") u.set("action", q.action);
    if (q.range !== "24h") u.set("range", q.range); if (p > 1) u.set("page", String(p));
    return `/admin/audit-log${u.toString() ? `?${u}` : ""}`;
  };
  const exportQs = new URLSearchParams({ q: q.q, role: q.role, action: q.action, range: q.range }).toString();
  const fmt = (iso: string) => {
    const d = new Date(iso);
    const t = d.toLocaleTimeString("en-GB", { timeZone: "Asia/Colombo", hour: "2-digit", minute: "2-digit" });
    return q.range === "24h" ? t : `${d.toLocaleDateString("en-GB", { timeZone: "Asia/Colombo", day: "numeric", month: "short" })}, ${t}`;
  };
  const nums = Array.from({ length: Math.min(pages, 5) }, (_, i) => Math.max(1, Math.min(page - 2, pages - 4)) + i).filter((n) => n >= 1 && n <= pages);
  const pill = "rounded-full border px-4 py-2 text-[14px] font-bold";

  return (
    <AdminFrame
      role="admin" title="Audit log" subtitle="Every admin and moderator action is recorded and cannot be edited"
      actions={<a href={`/api/admin/audit/export?${exportQs}`} download className="rounded-lg border-2 border-navy px-5 py-3 text-[16px] font-bold hover:bg-navy hover:text-white">Export CSV</a>}
    >
      <AuditFilters q={q.q} role={q.role} action={q.action} range={q.range} actions={actions} />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead><tr className="text-[14px] text-muted">{["Time", "Person", "Role", "Action", "Target", "Result"].map((h) => <th key={h} scope="col" className="pb-2 font-bold">{h}</th>)}</tr></thead>
            <tbody>
              {slice.map((e) => (
                <tr key={e.id} className="border-t border-line text-[15px]">
                  <td className="whitespace-nowrap py-3.5 pr-4 text-muted">{fmt(e.at)}</td>
                  <th scope="row" className="pr-4 font-bold">{e.actor}</th>
                  <td className="pr-4">{roleBadge(e.role)}</td>
                  <td className="pr-4">{e.action}</td>
                  <td className="pr-4 text-muted">{e.target}</td>
                  <td className="whitespace-nowrap font-semibold">{e.result === "done" ? "✓ Done" : "▲ Blocked"}</td>
                </tr>
              ))}
              {slice.length === 0 && <tr><td colSpan={6} className="py-8 text-[16px] text-muted">No entries match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[14px] text-muted">
          <p>Showing {slice.length} of {rows.length.toLocaleString("en-GB")} entries · kept for 12 months</p>
          <nav aria-label="Pages" className="flex items-center gap-2">
            {page > 1 ? <Link href={href(page - 1)} className={`${pill} border-line bg-white text-navy`}>‹ Prev</Link> : <span className={`${pill} border-line text-muted opacity-60`}>‹ Prev</span>}
            {nums.map((n) => <Link key={n} href={href(n)} aria-current={n === page ? "page" : undefined} className={`${pill} ${n === page ? "border-navy bg-navy text-white" : "border-line bg-white text-navy"}`}>{n}</Link>)}
            {page < pages ? <Link href={href(page + 1)} className={`${pill} border-line bg-white text-navy`}>Next ›</Link> : <span className={`${pill} border-line text-muted opacity-60`}>Next ›</span>}
          </nav>
        </div>
      </Card>
    </AdminFrame>
  );
}
