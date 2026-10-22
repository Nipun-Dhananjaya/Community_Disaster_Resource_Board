"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJson } from "../../lib/client-auth";
import { Field, inputClass } from "../request/ui";

export function ReserveForm({
  listingId, unit, limit, left, delivery, holdHours,
}: { listingId: string; unit: string; limit: number; left: number; delivery: boolean; holdHours: number }) {
  const router = useRouter();
  const max = Math.min(limit, left);
  const [qty, setQty] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<"pickup" | "delivery">("pickup");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState<{ reference: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErrors({}); setFormError(null);
    try {
      const r = await postJson<{ error?: string; errors?: Record<string, string>; reference?: string }>("/api/reservations", { listingId, quantity: qty.replace(/\D/g, ""), name, phone, method });
      if (r.ok && r.data.reference) { setDone({ reference: r.data.reference }); router.refresh(); }
      else { setErrors(r.data.errors ?? {}); if (!r.data.errors) setFormError(r.data.error ?? "Couldn’t reserve. Please try again."); }
    } catch {
      setFormError("Couldn’t reach the server. Please try again.");
    } finally { setBusy(false); }
  }

  if (done) {
    return (
      <section aria-labelledby="rsv-h" className="rounded-xl border border-line bg-white p-6">
        <h2 id="rsv-h" className="font-display text-[24px] font-bold">Reserved</h2>
        <p className="mt-3 text-[16px] leading-7">Your reference is <strong>{done.reference}</strong>. Show it when you {method === "delivery" ? "receive the delivery" : "collect"}. It is held for {holdHours} hours.</p>
        <button type="button" onClick={() => { setDone(null); setQty(""); }} className="mt-4 text-[15px] font-bold underline underline-offset-2">Reserve more</button>
      </section>
    );
  }

  const aria = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-err` : undefined }) as const;
  const chip = (on: boolean) => `rounded-full border px-4 py-2 text-[15px] font-bold ${on ? "border-navy bg-navy text-white" : "border-line bg-white"}`;

  return (
    <form noValidate onSubmit={submit} aria-labelledby="rsv-h" className="rounded-xl border border-line bg-white p-6">
      <h2 id="rsv-h" className="font-display text-[26px] font-bold leading-tight">Request this supply</h2>
      <div className="mt-4 space-y-4">
        <Field id="qty" label={`Quantity (max ${max})`} error={errors.quantity}>
          <input id="qty" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} placeholder={`6 ${unit}`} className={inputClass} {...aria("quantity")} />
        </Field>
        <Field id="rname" label="Your name" error={errors.name}>
          <input id="rname" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nimali Fernando" className={inputClass} {...aria("name")} />
        </Field>
        <Field id="rphone" label="Phone" error={errors.phone}>
          <input id="rphone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="077 000 0000" className={inputClass} {...aria("phone")} />
        </Field>
        <div className="flex flex-wrap gap-2" role="group" aria-label="How you will get it">
          <button type="button" aria-pressed={method === "pickup"} onClick={() => setMethod("pickup")} className={chip(method === "pickup")}>Pickup</button>
          {delivery ? (
            <button type="button" aria-pressed={method === "delivery"} onClick={() => setMethod("delivery")} className={chip(method === "delivery")}>Delivery</button>
          ) : (
            <button type="button" disabled className={`${chip(false)} cursor-not-allowed text-muted`}>Delivery not offered</button>
          )}
        </div>
        {formError && <p role="alert" className="rounded-lg border border-[#e8b4ae] bg-alert-soft p-3 text-[15px] font-bold text-alert">{formError}</p>}
        <button type="submit" disabled={busy || max < 1} className="w-full rounded-lg bg-alert py-4 text-[17px] font-bold text-white hover:brightness-110 disabled:opacity-60">
          {max < 1 ? "None left" : busy ? "Reserving…" : method === "delivery" ? "Reserve for delivery" : "Reserve for pickup"}
        </button>
        <p className="text-[14px] text-muted">Reservations are held for {holdHours} hours.</p>
      </div>
    </form>
  );
}
