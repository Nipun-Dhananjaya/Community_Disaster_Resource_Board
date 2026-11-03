import { notFound } from "next/navigation";
import { OrgFrame } from "../../../components/dashboard/frames";
import { IncomingRequests } from "../../../components/dashboard/org/IncomingRequests";
import { ListingsTable } from "../../../components/dashboard/org/ListingsTable";
import { PendingNotice } from "../../../components/dashboard/org/PendingNotice";
import { ReportsApp } from "../../../components/dashboard/org/ReportsApp";
import { VolunteersApp } from "../../../components/dashboard/org/VolunteersApp";
import { ComingSoon } from "../../../components/dashboard/ui";
import { requireRole } from "../../../lib/server/guard";
import { getOrgData, getWeek } from "../../../lib/server/org";

export const dynamic = "force-dynamic";
const known = ["my-listings", "incoming-requests", "volunteers", "reports", "settings"];

export default async function OrgSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!known.includes(section)) notFound();
  const s = await requireRole(["organization"], `/org/${section}`);

  // Every page in the console needs an approved registration.
  if (s.orgStatus !== "approved") {
    return <OrgFrame title="Registration status" subtitle={s.name}><PendingNotice status={s.orgStatus} /></OrgFrame>;
  }
  if (section === "volunteers") {
    const weeks = { "-1": getWeek(s.id, -1), "0": getWeek(s.id, 0), "1": getWeek(s.id, 1) };
    return <VolunteersApp orgName={s.name} weeks={weeks} roster={getOrgData(s.id).roster} />;
  }
  if (section === "reports") return <ReportsApp orgName={s.name} />;
  if (section === "my-listings") return <OrgFrame title="My listings" subtitle={s.name}><ListingsTable /></OrgFrame>;
  if (section === "incoming-requests") return <OrgFrame title="Incoming requests" subtitle={s.name}><IncomingRequests /></OrgFrame>;
  return <OrgFrame title="Settings" subtitle={s.name}><ComingSoon title="Settings" /></OrgFrame>;
}
