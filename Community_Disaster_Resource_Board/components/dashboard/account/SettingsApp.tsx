"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { notifyAuthChange, postJson } from "../../../lib/client-auth";
import type { Prefs } from "../../../lib/server/users";
import { Field, inputClass } from "../../request/ui";

export interface SettingsInitial {
  profile: { name: string; phone: string; email: string; homeArea: string };
  prefs: Prefs; staff: boolean; signIns: { at: string; action: string; result: string }[];
}

function Toggle({ label, hint, on, onChange }: { label: string; hint: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line py-4 first:border-t-0">
      <div>
        <p className="text-[16px] font-bold" id={`t-${label}`}>{label}</p>
        <p className="mt-0.5 text-[14px] text-muted">{hint}</p>
      </div>
      <button type="button" role="switch" aria-checked={on} aria-labelledby={`t-${label}`} onClick={() => onChange(!on)}
        className={`relative h-8 w-[52px] shrink-0 rounded-full transition-colors ${on ? "bg-ok" : "bg-[#c3cfda]"}`}>
        <span className={`absolute top-1 size-6 rounded-full bg-white shadow transition-all ${on ? "left-[24px]" : "left-1"}`} />
      </button>
    </div>
  );
}
const Card = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-4 rounded-xl border border-line bg-white p-6">
    <h2 id={`${id}-h`} className="mb-3 font-display text-[26px] font-bold">{title}</h2>
    {children}
  </section>
);
const chip = (on: boolean) => `rounded-full border px-4 py-1.5 text-[14px] font-bold ${on ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-navy"}`;

export function SettingsApp({ initial }: { initial: SettingsInitial }) {
  const router = useRouter();
  const [prefs, setPrefs] = useState(initial.prefs);
  const [saved, setSaved] = useState<string | null>(null);
  const [profile, setProfile] = useState(initial.profile);
  const [perr, setPerr] = useState<Record<string, string>>({});
  const [pmsg, setPmsg] = useState<string | null>(null);
  const [pw, setPw] = useState({ current: "", next: "" });
  const [pwmsg, setPwmsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [delPw, setDelPw] = useState("");
  const [delErr, setDelErr] = useState<string | null>(null);

  async function setPref(patch: Partial<Prefs>) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    if ("lowBandwidth" in patch) { try { localStorage.setItem("cdrb-lowbw", patch.lowBandwidth ? "1" : "0"); } catch {} document.documentElement.classList.toggle("lowbw", !!patch.lowBandwidth); }
    if ("largerText" in patch) { try { localStorage.setItem("cdrb-larger", patch.largerText ? "1" : "0"); } catch {} document.documentElement.classList.toggle("larger-text", !!patch.largerText); }
    const r = await postJson("/api/account/preferences", next);
    setSaved(r.ok ? "Saved" : "Couldn’t save that change. Please try again.");
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); setPerr({}); setPmsg(null);
    const r = await postJson<{ errors?: Record<string, string>; error?: string }>("/api/account/profile", profile);
    if (r.ok) { setPmsg("Saved"); notifyAuthChange(); router.refresh(); } else { setPerr(r.data.errors ?? {}); if (!r.data.errors) setPmsg(r.data.error ?? "Couldn’t save."); }
  }
  async function changePw(e: React.FormEvent) {
    e.preventDefault(); setPwmsg(null);
    const r = await postJson<{ error?: string }>("/api/account/password", pw);
    if (r.ok) { setPw({ current: "", next: "" }); setPwmsg({ ok: true, text: "Password changed." }); } else setPwmsg({ ok: false, text: r.data.error ?? "Couldn’t change the password." });
  }
  async function del() {
    setDelErr(null);
    const r = await postJson<{ error?: string }>("/api/account/delete", { password: delPw });
    if (r.ok) { notifyAuthChange(); router.push("/"); router.refresh(); } else setDelErr(r.data.error ?? "Couldn’t delete the account.");
  }
  const aria = (k: string) => ({ "aria-invalid": !!perr[k], "aria-describedby": perr[k] ? `${k}-err` : undefined }) as const;
  const toggleChannel = (c: string) => setPref({ channels: prefs.channels.includes(c) ? prefs.channels.filter((x) => x !== c) : [...prefs.channels, c] });

  const jump = [["profile", "Profile"], ["notifications", "Notifications"], ["display", "Language and display"], ["privacy", "Privacy"], ["security", "Security"]];

  return (
    <div>
      <nav aria-label="Settings sections" className="mb-5 flex flex-wrap gap-2">
        {jump.map(([id, label], i) => (
          <a key={id} href={`#${id}`} className={`rounded-full border px-4 py-1.5 text-[14px] font-bold ${i === 0 ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-navy"}`}>{label}</a>
        ))}
      </nav>
      <p role="status" className="mb-3 min-h-[20px] text-[14px] text-muted">{saved}</p>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <Card id="profile" title="Profile">
            <form noValidate onSubmit={saveProfile} className="space-y-4">
              <Field id="p-name" label="Full name" error={perr.name}><input id="p-name" autoComplete="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={inputClass} {...aria("name")} /></Field>
              <Field id="p-phone" label="Phone" error={perr.phone}><input id="p-phone" type="tel" autoComplete="tel" placeholder="077 000 0000" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className={inputClass} {...aria("phone")} /></Field>
              <Field id="p-email" label="Email" error={perr.email}><input id="p-email" type="email" autoComplete="email" placeholder="nimali@example.com" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className={inputClass} {...aria("email")} /></Field>
              <Field id="p-area" label="Home area" error={perr.homeArea}><input id="p-area" autoComplete="address-level2" placeholder="Negombo" value={profile.homeArea} onChange={(e) => setProfile({ ...profile, homeArea: e.target.value })} className={inputClass} {...aria("homeArea")} /></Field>
              <div className="flex items-center gap-4">
                <button type="submit" className="rounded-lg bg-navy px-6 py-3.5 text-[16px] font-bold text-white hover:bg-navy-soft">Save changes</button>
                <p role="status" className="text-[14px] text-muted">{pmsg}</p>
              </div>
            </form>
          </Card>

          <Card id="security" title="Security">
            <form noValidate onSubmit={changePw} className="space-y-4">
              <Field id="pw-cur" label="Current password"><input id="pw-cur" type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className={inputClass} /></Field>
              <Field id="pw-new" label="New password" hint="At least 8 characters."><input id="pw-new" type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className={inputClass} aria-describedby="pw-new-hint" /></Field>
              <button type="submit" className="rounded-lg border-2 border-navy px-5 py-3 text-[15px] font-bold hover:bg-navy hover:text-white">Change password</button>
              {pwmsg && <p role="status" className={`text-[14px] font-bold ${pwmsg.ok ? "text-ok" : "text-alert"}`}>{pwmsg.text}</p>}
            </form>
          </Card>
        </div>

        <div className="space-y-5">
          <Card id="notifications" title="Notifications">
            <Toggle label="Alerts for my area" hint="Official warnings and road closures" on={prefs.alerts} onChange={(v) => setPref({ alerts: v })} />
            <Toggle label="Request updates" hint="When a responder replies or matches you" on={prefs.requestUpdates} onChange={(v) => setPref({ requestUpdates: v })} />
            <Toggle label="Weekly digest" hint="A summary of new nearby resources" on={prefs.digest} onChange={(v) => setPref({ digest: v })} />
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="mr-1 text-[15px] font-bold">Send by</span>
              {[["sms", "SMS"], ["app", "App"], ["email", "Email"]].map(([k, l]) => (
                <button key={k} type="button" aria-pressed={prefs.channels.includes(k)} onClick={() => toggleChannel(k)} className={chip(prefs.channels.includes(k))}>{l}</button>
              ))}
            </div>
          </Card>

          <Card id="display" title="Language and display">
            <div role="group" aria-label="Language" className="flex flex-wrap gap-2 pb-3">
              {([["en", "English"], ["si", "Sinhala"], ["ta", "Tamil"]] as const).map(([k, l]) => (
                <button key={k} type="button" aria-pressed={prefs.language === k} onClick={() => setPref({ language: k })} className={chip(prefs.language === k)}>{l}</button>
              ))}
            </div>
            <p className="pb-2 text-[13px] text-muted">Translations are still being added. Your choice is saved for when they are ready.</p>
            <Toggle label="Low-bandwidth mode" hint="Text only, no images" on={prefs.lowBandwidth} onChange={(v) => setPref({ lowBandwidth: v })} />
            <Toggle label="Larger text" hint="Increase text size across the site" on={prefs.largerText} onChange={(v) => setPref({ largerText: v })} />
          </Card>

          <Card id="privacy" title="Privacy and account">
            <Toggle label="Hide my profile from volunteers" hint="Responders still see requests you submit" on={prefs.hideProfile} onChange={(v) => setPref({ hideProfile: v })} />
            <div className="flex flex-wrap gap-3 pt-3">
              <a href="/api/account/export" download className="rounded-lg border-2 border-navy px-4 py-2.5 text-[15px] font-bold hover:bg-navy hover:text-white">Download my data</a>
              <button type="button" disabled={initial.staff} onClick={() => setConfirmDel(true)} className="rounded-lg bg-alert px-4 py-3 text-[15px] font-bold text-white hover:brightness-110 disabled:opacity-50">Delete account</button>
            </div>
            {initial.staff && <p className="mt-2 text-[13px] text-muted">Staff accounts carry audit history, so another admin must close them.</p>}
            {confirmDel && !initial.staff && (
              <div className="mt-4 rounded-lg border border-[#e8b4ae] bg-alert-soft p-4">
                <p className="text-[15px] font-bold">This permanently deletes your account. Enter your password to confirm.</p>
                <label htmlFor="del-pw" className="sr-only">Password</label>
                <input id="del-pw" type="password" autoComplete="current-password" value={delPw} onChange={(e) => setDelPw(e.target.value)} className={`${inputClass} mt-3`} />
                {delErr && <p role="alert" className="mt-2 text-[14px] font-bold text-alert">{delErr}</p>}
                <div className="mt-3 flex gap-3">
                  <button type="button" onClick={del} disabled={!delPw} className="rounded-lg bg-alert px-4 py-2.5 text-[15px] font-bold text-white disabled:opacity-60">Delete my account</button>
                  <button type="button" onClick={() => { setConfirmDel(false); setDelPw(""); setDelErr(null); }} className="text-[15px] font-bold underline underline-offset-2">Cancel</button>
                </div>
              </div>
            )}
          </Card>

          {initial.staff && (
            <section aria-labelledby="staff-h" className="rounded-xl border-2 border-dashed border-navy p-6">
              <h2 id="staff-h" className="text-[18px] font-bold">Admin and moderator extras</h2>
              <p className="mt-2 text-[15px] leading-7 text-muted">Two-factor sign-in is required, and sessions end after 30 minutes. Your recent sign-ins:</p>
              <ul className="mt-2 space-y-1 text-[14px]">
                {initial.signIns.length === 0 && <li className="text-muted">No sign-ins recorded yet.</li>}
                {initial.signIns.map((s, i) => (
                  <li key={i}>{new Date(s.at).toLocaleString("en-GB", { timeZone: "Asia/Colombo", dateStyle: "medium", timeStyle: "short" })} · {s.action} · {s.result === "done" ? "✓ Done" : "▲ Blocked"}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
