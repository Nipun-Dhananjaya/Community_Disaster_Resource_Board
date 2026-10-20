"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJson } from "../../../lib/client-auth";
import { Field, inputClass } from "../../request/ui";

export function PublishAlertForm() {
  const router = useRouter();
  const [v, setV] = useState({ title: "", areas: "", severity: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null); setErrors({});
    const r = await postJson<{ error?: string; errors?: Record<string, string> }>("/api/admin/alerts", v);
    setBusy(false);
    if (r.ok) { setV({ title: "", areas: "", severity: "" }); setMsg("Alert published and recorded in the audit log."); router.refresh(); }
    else { setErrors(r.data.errors ?? {}); if (!r.data.errors) setMsg(r.data.error ?? "Couldn’t publish."); }
  }

  const aria = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-err` : undefined }) as const;
  return (
    <form id="publish" noValidate onSubmit={submit} className="space-y-4">
      <Field id="title" label="Alert title" error={errors.title}>
        <input id="title" value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} placeholder="Kelani River flooding" className={inputClass} {...aria("title")} />
      </Field>
      <Field id="areas" label="Affected areas" error={errors.areas}>
        <input id="areas" value={v.areas} onChange={(e) => setV({ ...v, areas: e.target.value })} placeholder="Gampaha and Colombo districts" className={inputClass} {...aria("areas")} />
      </Field>
      <Field id="severity" label="Severity" error={errors.severity}>
        <select id="severity" value={v.severity} onChange={(e) => setV({ ...v, severity: e.target.value })} className={inputClass} {...aria("severity")}>
          <option value="">Choose…</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
        </select>
      </Field>
      <button type="submit" disabled={busy} className="rounded-lg bg-alert px-6 py-3.5 text-[16px] font-bold text-white hover:brightness-110 disabled:opacity-60">{busy ? "Publishing…" : "Publish alert"}</button>
      <p role="status" className="text-[14px] text-muted">{msg}</p>
    </form>
  );
}
