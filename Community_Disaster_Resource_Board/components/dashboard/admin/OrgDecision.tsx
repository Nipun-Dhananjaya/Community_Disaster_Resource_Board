"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJson } from "../../../lib/client-auth";

export function OrgDecision({ userId }: { userId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function decide(decision: "approve" | "reject") {
    setBusy(true); setErr(null);
    const r = await postJson<{ error?: string }>("/api/admin/orgs", { userId, decision });
    setBusy(false);
    if (r.ok) router.refresh(); else setErr(r.data.error ?? "Failed");
  }
  return (
    <span className="flex items-center gap-2">
      <button type="button" disabled={busy} onClick={() => decide("approve")} className="rounded-lg bg-ok px-3 py-1.5 text-[14px] font-bold text-white disabled:opacity-60">Approve</button>
      <button type="button" disabled={busy} onClick={() => decide("reject")} className="rounded-lg border-2 border-navy px-3 py-1 text-[14px] font-bold disabled:opacity-60">Reject</button>
      {err && <span role="alert" className="text-[13px] font-bold text-alert">{err}</span>}
    </span>
  );
}
