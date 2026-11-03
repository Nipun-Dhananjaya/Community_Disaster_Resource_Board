"use client";

import Link from "next/link";
import { useState } from "react";
import { postJson } from "../../lib/client-auth";
import { topics, type TopicKey } from "../../lib/contact-topics";
import { Field, inputClass } from "../request/ui";

export function ContactForm({ initialTopic, initialMessage }: { initialTopic: TopicKey; initialMessage: string }) {
  const [topic, setTopic] = useState<TopicKey>(initialTopic);
  const [v, setV] = useState({ name: "", contact: "", organization: "", message: initialMessage, website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErrors({}); setFormError(null);
    try {
      const r = await postJson<{ error?: string; errors?: Record<string, string>; reference?: string }>("/api/contact", { topic, ...v });
      if (r.ok) setDone(r.data.reference ?? "");
      else { setErrors(r.data.errors ?? {}); if (!r.data.errors) setFormError(r.data.error ?? "Couldn’t send your message. Please try again."); }
    } catch {
      setFormError("Couldn’t reach the server. Please check your connection and try again.");
    } finally { setBusy(false); }
  }

  if (done !== null) {
    return (
      <section aria-labelledby="sent-h" className="rounded-xl border border-line bg-white p-7 sm:p-8">
        <h2 id="sent-h" className="font-display text-[30px] font-bold">Message sent</h2>
        <p className="mt-3 text-[17px] leading-8">Thank you. {done && <>Your reference is <strong>{done}</strong>. </>}We reply within 2 working days, and within one day for partner organizations.</p>
        <p className="mt-3 rounded-lg bg-alert-soft p-4 text-[15px]"><strong>If anyone is in danger, call 119 or the disaster hotline 117 now.</strong> Don’t wait for a reply.</p>
        <button type="button" onClick={() => { setDone(null); setV({ name: "", contact: "", organization: "", message: "", website: "" }); }} className="mt-5 text-[15px] font-bold underline underline-offset-2">Send another message</button>
      </section>
    );
  }

  const aria = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-err` : undefined }) as const;
  return (
    <form noValidate onSubmit={submit} className="rounded-xl border border-line bg-white p-6 sm:p-8" aria-label="Contact form">
      <fieldset>
        <legend className="text-[15px] font-bold">I am writing about</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {topics.map((t) => (
            <button key={t.key} type="button" aria-pressed={topic === t.key} onClick={() => setTopic(t.key)}
              className={`rounded-full border px-4 py-2 text-[15px] font-bold ${topic === t.key ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-navy"}`}>{t.label}</button>
          ))}
        </div>
        {errors.topic && <p role="alert" className="mt-2 text-[14px] font-bold text-alert">{errors.topic}</p>}
      </fieldset>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field id="c-name" label="Your name" error={errors.name}><input id="c-name" autoComplete="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className={inputClass} {...aria("name")} /></Field>
        <Field id="c-contact" label="Email or phone" error={errors.contact}><input id="c-contact" autoComplete="email" value={v.contact} onChange={(e) => setV({ ...v, contact: e.target.value })} className={inputClass} {...aria("contact")} /></Field>
      </div>
      <div className="mt-5">
        <Field id="c-org" label="Organization" optional error={errors.organization}><input id="c-org" autoComplete="organization" value={v.organization} onChange={(e) => setV({ ...v, organization: e.target.value })} className={inputClass} {...aria("organization")} /></Field>
      </div>
      <div className="mt-5">
        <Field id="c-msg" label="Message" error={errors.message}><textarea id="c-msg" rows={6} maxLength={2000} value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} className={inputClass} {...aria("message")} /></Field>
      </div>

      {/* Hidden trap for spam bots. People never see or fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website<input tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => setV({ ...v, website: e.target.value })} /></label>
      </div>

      {formError && <p role="alert" className="mt-5 rounded-lg border border-[#e8b4ae] bg-alert-soft p-3 text-[15px] font-bold text-alert">{formError}</p>}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[14px] text-muted">We use your details only to reply. See the <Link href="/privacy" className="font-semibold underline underline-offset-2">Privacy Policy</Link>.</p>
        <button type="submit" disabled={busy} className="rounded-lg bg-alert px-8 py-4 text-[17px] font-bold text-white hover:brightness-110 disabled:opacity-60">{busy ? "Sending…" : "Send message"}</button>
      </div>
    </form>
  );
}
