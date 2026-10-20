import Link from "next/link";
import type { OrgStatus } from "../../../lib/roles";
import { Card } from "../ui";

export function PendingNotice({ status }: { status: OrgStatus }) {
  const rejected = status === "rejected";
  return (
    <Card>
      <h2 className="font-display text-[26px] font-bold">{rejected ? "Registration not approved" : "Waiting for approval"}</h2>
      <p className="mt-3 max-w-[560px] text-[16px] leading-7 text-muted">
        {rejected
          ? "An admin couldn’t approve your organization’s registration. Please contact the team to resolve this."
          : "Your organization’s registration is waiting for an admin to review it. The console unlocks as soon as it is approved. Until then you can still ask for help or browse the board."}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/board" className="rounded-lg bg-navy px-5 py-3 font-bold text-white hover:bg-navy-soft">Open the board</Link>
        <Link href="/contact" className="rounded-lg border-2 border-navy px-5 py-2.5 font-bold hover:bg-navy hover:text-white">Contact the team</Link>
      </div>
    </Card>
  );
}
