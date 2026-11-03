"use client";

import { useState } from "react";
import { postJson } from "../../lib/client-auth";
import { Field, inputClass } from "../request/ui";

export function BarrierForm() {
  const [v, setV] = useState({ message: "", contact: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErrors({}); setMsg(null);
    try {
      const r = await postJson<{ error?: string; errors?: Record<string, string> }>("/api/accessibility-feedback", v);
      if (r.ok) { setV({ message: "", contact: "", website: "" }); setMsg({ ok: true, text: "Thank you. We read every report and fix barriers as fast as we can." }); }
      else { setErrors(r.data.errors ?? {}); if (!r.data.errors) setMsg({ ok: false, text: r.data.error ?? "Couldn’t send. Please try again." }); }
    } catch { setMsg({ ok: false, text: "Couldn’t reach the server. Please try again." }); }
    finally { setBusy(false); }
  }
  const aria = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-err` : undefined }) as const;

  return (
    <form noValidate onSubmit={submit} aria-labelledby="barrier-h" className="space-y-4">
      <h2 id="barrier-h" className="font-display text-[30px] font-bold leading-tight">Tell us about a barrier</h2>
      <Field id="b-msg" label="What went wrong?" error={errors.message}><textarea id="b-msg" rows={3} maxLength={1500} value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} className={inputClass} {...aria("message")} /></Field>
      <Field id="b-contact" label="Contact" optional error={errors.contact}><input id="b-contact" autoComplete="email" value={v.contact} onChange={(e) => setV({ ...v, contact: e.target.value })} className={inputClass} {...aria("contact")} /></Field>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Website<input tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => setV({ ...v, website: e.target.value })} /></label></div>
      <button type="submit" disabled={busy} className="w-full rounded-lg bg-navy py-4 text-[17px] font-bold text-white hover:bg-navy-soft disabled:opacity-60">{busy ? "Sending…" : "Send feedback"}</button>
      <p role="status" className={`text-[14px] leading-6 ${msg && !msg.ok ? "font-bold text-alert" : "text-ok"}`}>{msg?.text}</p>
    </form>
  );
}
