"use client";

import { useState } from "react";
import { postJson } from "../../lib/client-auth";
import { Field, inputClass } from "../request/ui";

const types = [{ key: "official", label: "Official warnings" }, { key: "road", label: "Road closures" }, { key: "weather", label: "Weather" }];
const channelOpts = [{ key: "sms", label: "SMS" }, { key: "email", label: "Email" }, { key: "app", label: "App" }];

export function SubscribeForm() {
  const [area, setArea] = useState("");
  const [picked, setPicked] = useState<string[]>(["official", "road"]);
  const [channels, setChannels] = useState<string[]>(["sms"]);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const toggle = (list: string[], set: (v: string[]) => void, k: string) => set(list.includes(k) ? list.filter((x) => x !== k) : [...list, k]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErrors({}); setMsg(null);
    try {
      const r = await postJson<{ error?: string; errors?: Record<string, string> }>("/api/subscriptions", { area, types: picked, channels, phone, email });
      if (r.ok) setMsg({ ok: true, text: `Subscribed. Alerts for ${area.trim()} are set up.` });
      else { setErrors(r.data.errors ?? {}); if (!r.data.errors) setMsg({ ok: false, text: r.data.error ?? "Couldn’t subscribe. Please try again." }); }
    } catch {
      setMsg({ ok: false, text: "Couldn’t reach the server. Please try again." });
    } finally { setBusy(false); }
  }

  const aria = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-err` : undefined }) as const;
  return (
    <form noValidate onSubmit={submit} className="space-y-5" aria-labelledby="sub-h">
      <h2 id="sub-h" className="font-display text-[26px] font-bold leading-tight">Get alerts for your area</h2>
      <Field id="area" label="Area" error={errors.area}>
        <input id="area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Negombo, Gampaha" autoComplete="address-level2" className={inputClass} {...aria("area")} />
      </Field>

      <fieldset>
        <legend className="text-[15px] font-bold">Alert types</legend>
        <div className="mt-3 space-y-3">
          {types.map((t) => (
            <label key={t.key} className="flex cursor-pointer items-center gap-3 text-[16px]">
              <input type="checkbox" checked={picked.includes(t.key)} onChange={() => toggle(picked, setPicked, t.key)} className="size-5 accent-navy" />
              {t.label}
            </label>
          ))}
        </div>
        {errors.types && <p role="alert" className="mt-2 text-[14px] font-bold text-alert">{errors.types}</p>}
      </fieldset>

      <fieldset>
        <legend className="text-[15px] font-bold">Send me</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {channelOpts.map((c) => (
            <button key={c.key} type="button" aria-pressed={channels.includes(c.key)} onClick={() => toggle(channels, setChannels, c.key)}
              className={`rounded-full border px-5 py-2 text-[15px] font-bold ${channels.includes(c.key) ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-navy"}`}>
              {c.label}
            </button>
          ))}
        </div>
        {errors.channels && <p role="alert" className="mt-2 text-[14px] font-bold text-alert">{errors.channels}</p>}
      </fieldset>

      {channels.includes("sms") && (
        <Field id="phone" label="Phone number for SMS" error={errors.phone}>
          <input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="077 000 0000" className={inputClass} {...aria("phone")} />
        </Field>
      )}
      {channels.includes("email") && (
        <Field id="email" label="Email address" error={errors.email}>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} {...aria("email")} />
        </Field>
      )}

      <button type="submit" disabled={busy} className="w-full rounded-lg bg-navy py-4 text-[17px] font-bold text-white hover:bg-navy-soft disabled:opacity-60">
        {busy ? "Subscribing…" : "Subscribe"}
      </button>
      <p role="status" className={`text-[14px] leading-6 ${msg && !msg.ok ? "font-bold text-alert" : "text-muted"}`}>{msg?.text}</p>
    </form>
  );
}
