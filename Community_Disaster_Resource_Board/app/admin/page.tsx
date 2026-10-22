import type { Metadata } from "next";
import { AdminFrame } from "../../components/dashboard/frames";
import { ModerationQueue } from "../../components/dashboard/admin/ModerationQueue";
import { GapsMap } from "../../components/dashboard/admin/GapsMap";
import { Card, StatCard } from "../../components/dashboard/ui";
import { demoUtilization } from "../../lib/dashboard-demo";
import { listQueue } from "../../lib/server/data";
import { incident } from "../../lib/data";
import { requireRole } from "../../lib/server/guard";

export const metadata: Metadata = { title: "Admin console · Community Disaster Resource Board", robots: { index: false } };

export default async function AdminPage() {
  const s = await requireRole(["admin", "moderator"], "/admin");
  const rows = listQueue().map((q) => ({ ...q, waitingMin: Math.max(1, Math.round((Date.now() - q.createdAt) / 60000)) }));
  return (
      <AdminFrame
          role={s.role}
          title="Moderation and incidents"
          subtitle={`${s.role === "admin" ? "Admin" : "Moderator"} dashboard · ${incident.name} is active`}
          action={s.role === "admin" ? { href: "/admin/incidents#publish", label: "Publish alert" } : undefined}
      >
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Active listings" value={412} />
          <StatCard label="Open requests" value={31} />
          <StatCard label="Unmatched critical" value={5} valueClass="text-alert" />
          <StatCard label="New users today" value={64} />
          <StatCard label="Flagged content" value={3} valueClass="text-[#8a4a0a]" />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <Card title="Moderation queue"><ModerationQueue rows={rows} /></Card>
          <GapsMap />
        </div>
        <Card title="Resource utilization today" className="mt-5">
          <ul className="space-y-3">
            {demoUtilization.map((u) => (
                <li key={u.label} className="grid grid-cols-[130px_1fr_44px] items-center gap-3 text-[15px]">
                  <span className="font-bold">{u.label}</span>
                  <span role="img" aria-label={`${u.label} ${u.pct} percent`} className="h-3.5 overflow-hidden rounded-full bg-[#e3e9ef]"><span className={`block h-full ${u.bar}`} style={{ width: `${u.pct}%` }} /></span>
                  <span className="text-[14px] text-muted">{u.pct}%</span>
                </li>
            ))}
          </ul>
        </Card>
      </AdminFrame>
  );
}
