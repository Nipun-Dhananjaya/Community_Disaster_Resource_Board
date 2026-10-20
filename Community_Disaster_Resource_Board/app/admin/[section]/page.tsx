import { notFound } from "next/navigation";
import { AdminFrame } from "../../../components/dashboard/frames";
import { GapsMap } from "../../../components/dashboard/admin/GapsMap";
import { ModerationQueue } from "../../../components/dashboard/admin/ModerationQueue";
import { OrgDecision } from "../../../components/dashboard/admin/OrgDecision";
import { PublishAlertForm } from "../../../components/dashboard/admin/PublishAlertForm";
import { Badge, Card, ComingSoon } from "../../../components/dashboard/ui";
import { listAlerts, listAudit, listQueue } from "../../../lib/server/data";
import { requireRole } from "../../../lib/server/guard";
import { listUsers } from "../../../lib/server/users";
import { roleLabel } from "../../../lib/roles";

const titles: Record<string, string> = {
  moderation: "Moderation", incidents: "Incidents", users: "Users", "map-overview": "Map overview", analytics: "Analytics", "audit-log": "Audit log",
};
const adminOnly = ["users", "analytics", "audit-log"];

const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Colombo", dateStyle: "medium", timeStyle: "short" });
const mask = (id: string) => (id.includes("@") ? id.replace(/^(.{2}).*(@.*)$/, "$1***$2") : `***${id.slice(-4)}`);

export default async function AdminSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!(section in titles)) notFound();
  const s = await requireRole(["admin", "moderator"], `/admin/${section}`);
  if (adminOnly.includes(section) && s.role !== "admin") notFound(); // checked on the server, not just hidden in the menu

  let body: React.ReactNode;
  if (section === "moderation") {
    const rows = listQueue().map((q) => ({ ...q, waitingMin: Math.max(1, Math.round((Date.now() - q.createdAt) / 60000)) }));
    body = <Card title="Moderation queue"><ModerationQueue rows={rows} /></Card>;
  } else if (section === "incidents") {
    body = (
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Published alerts">
          <ul className="divide-y divide-line border-t border-line">
            {listAlerts().map((a) => (
              <li key={a.id} className="py-3">
                <p className="flex flex-wrap items-center gap-2 text-[17px] font-bold">{a.title} <Badge tone={a.severity === "high" ? "alert" : a.severity === "medium" ? "warn" : "ok"}>{a.severity}</Badge></p>
                <p className="mt-1 text-[14px] text-muted">{a.areas} · {when(a.publishedAt)} · {a.by}</p>
              </li>
            ))}
          </ul>
        </Card>
        {s.role === "admin" ? <Card title="Publish alert"><PublishAlertForm /></Card> : <Card title="Publish alert"><p className="text-[15px] text-muted">Only admins can publish alerts.</p></Card>}
      </div>
    );
  } else if (section === "users") {
    body = (
      <Card title="Users">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left">
            <thead><tr className="text-[14px] text-muted"><th scope="col" className="pb-2 font-bold">Name</th><th scope="col" className="pb-2 font-bold">Contact</th><th scope="col" className="pb-2 font-bold">Role</th><th scope="col" className="pb-2 font-bold">Status</th><th scope="col" className="pb-2 font-bold"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {listUsers().map((u) => (
                <tr key={u.id} className="border-t border-line text-[15px]">
                  <th scope="row" className="py-3 pr-3 font-bold">{u.name}</th>
                  <td className="pr-3 text-muted">{mask(u.identifier)}</td>
                  <td className="pr-3">{roleLabel[u.role]}</td>
                  <td className="pr-3">{u.role === "organization" ? <Badge tone={u.orgStatus === "approved" ? "ok" : u.orgStatus === "pending" ? "warn" : "alert"}>{u.orgStatus}</Badge> : "Active"}</td>
                  <td>{u.role === "organization" && u.orgStatus === "pending" ? <OrgDecision userId={u.id} /> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  } else if (section === "audit-log") {
    const log = listAudit();
    body = (
      <Card title="Audit log" aside="Newest first. Kept in memory until a database is connected.">
        {log.length === 0 ? <p className="py-4 text-[16px] text-muted">No admin actions yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead><tr className="text-[14px] text-muted"><th scope="col" className="pb-2 font-bold">When</th><th scope="col" className="pb-2 font-bold">Who</th><th scope="col" className="pb-2 font-bold">Action</th></tr></thead>
              <tbody>
                {log.map((e) => (
                  <tr key={e.id} className="border-t border-line text-[15px]">
                    <td className="py-3 pr-4 text-muted">{when(e.at)}</td>
                    <td className="pr-4 font-bold">{e.actor} <span className="font-normal text-muted">({roleLabel[e.role]})</span></td>
                    <td>{e.action} <strong>{e.target}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    );
  } else if (section === "map-overview") {
    body = <GapsMap tall />;
  } else {
    body = <ComingSoon title={titles[section]} />;
  }

  return <AdminFrame role={s.role} title={titles[section]} subtitle={`${s.role === "admin" ? "Admin" : "Moderator"} dashboard`}>{body}</AdminFrame>;
}
