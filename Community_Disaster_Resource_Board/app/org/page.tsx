import type { Metadata } from "next";
import { OrgFrame } from "../../components/dashboard/frames";
import { CapacityCard } from "../../components/dashboard/org/CapacityCard";
import { IncomingRequests } from "../../components/dashboard/org/IncomingRequests";
import { ListingsTable } from "../../components/dashboard/org/ListingsTable";
import { PendingNotice } from "../../components/dashboard/org/PendingNotice";
import { StatCard } from "../../components/dashboard/ui";
import { getCapacity } from "../../lib/server/data";
import { requireRole } from "../../lib/server/guard";

export const metadata: Metadata = { title: "Organization dashboard · Community Disaster Resource Board" };

export default async function OrgPage() {
  const s = await requireRole(["organization"], "/org");

  // The console only opens once an admin has approved the organization's registration.
  if (s.orgStatus !== "approved") {
    return (
      <OrgFrame title={s.name} subtitle="Organization dashboard · Registration status">
        <PendingNotice status={s.orgStatus} />
      </OrgFrame>
    );
  }
  const cap = getCapacity(s.id);
  return (
    <OrgFrame title={s.name} subtitle="Organization dashboard · Verified" action={{ href: "/offer-help", label: "+ Post a resource" }}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Beds free" value={cap.beds} note="6 fewer than 2 h ago" noteClass="text-[#8a4a0a]" />
        <StatCard label="People sheltered" value={82} note="Since Monday: 311" />
        <StatCard label="Open requests nearby" value={7} note="2 critical" noteClass="text-alert" />
        <StatCard label="Volunteers on shift" value={12} note="Next shift 6 pm" />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)]">
        <CapacityCard beds={cap.beds} total={cap.total} status={cap.status} confirmedMinAgo={Math.max(0, Math.round((Date.now() - cap.confirmedAt) / 60000))} />
        <IncomingRequests />
      </div>
      <div className="mt-5"><ListingsTable /></div>
    </OrgFrame>
  );
}
