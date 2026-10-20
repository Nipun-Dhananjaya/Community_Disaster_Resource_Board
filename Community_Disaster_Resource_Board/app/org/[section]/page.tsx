import { notFound } from "next/navigation";
import { OrgFrame } from "../../../components/dashboard/frames";
import { IncomingRequests } from "../../../components/dashboard/org/IncomingRequests";
import { ListingsTable } from "../../../components/dashboard/org/ListingsTable";
import { PendingNotice } from "../../../components/dashboard/org/PendingNotice";
import { ComingSoon } from "../../../components/dashboard/ui";
import { requireRole } from "../../../lib/server/guard";

const sections: Record<string, { title: string; body: () => React.ReactNode }> = {
  "my-listings": { title: "My listings", body: () => <ListingsTable /> },
  "incoming-requests": { title: "Incoming requests", body: () => <IncomingRequests /> },
  volunteers: { title: "Volunteers", body: () => <ComingSoon title="Volunteers" /> },
  reports: { title: "Reports", body: () => <ComingSoon title="Reports" /> },
  settings: { title: "Settings", body: () => <ComingSoon title="Settings" /> },
};

export default async function OrgSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const s = await requireRole(["organization"], `/org/${section}`);
  const def = sections[section];
  if (!def) notFound();
  return (
    <OrgFrame title={def.title} subtitle={s.name}>
      {s.orgStatus === "approved" ? def.body() : <PendingNotice status={s.orgStatus} />}
    </OrgFrame>
  );
}
