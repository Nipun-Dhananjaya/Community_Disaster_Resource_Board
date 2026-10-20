"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { notifyAuthChange, pickDestination, postJson } from "../../lib/client-auth";
import type { Role } from "../../lib/roles";
import { Field, inputClass } from "../request/ui";
import { Icon } from "../Icon";

type Tab = "login" | "register";
type Registrable = "individual" | "volunteer" | "organization";
type AuthReply = { ok?: boolean; step?: string; role?: Role; home?: string; error?: string; errors?: Record<string, string> };

const roles: { key: Registrable; label: string }[] = [
  { key: "individual", label: "Individual" },
  { key: "volunteer", label: "Volunteer" },
  { key: "organization", label: "Organization" },
];

export function AuthPanel({ initialTab, footer }: { initialTab: Tab; footer?: React.ReactNode }) {
  const router = useRouter();
  const next = useSearchParams().get("next");

  const [tab, setTab] = useState<Tab>(initialTab);
  const [role, setRole] = useState<Registrable>("individual");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"form" | "2fa">("form");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function switchTab(t: Tab) { setTab(t); setErrors({}); setFormError(null); setInfo(null); setStep("form"); }

  function finish(r: AuthReply) {
    notifyAuthChange();
    router.push(pickDestination(next, r.role ?? "individual", r.home ?? "/"));
    router.refresh();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({}); setFormError(null); setInfo(null); setBusy(true);
    try {
      if (step === "2fa") {
        const r = await postJson<AuthReply>("/api/auth/2fa", { code });
        if (r.ok) return finish(r.data);
        setFormError(r.data.error ?? "Couldn’t verify the code.");
        if (r.status === 401 && /timed out/i.test(r.data.error ?? "")) setStep("form");
        return;
      }
      const r = tab === "register"
        ? await postJson<AuthReply>("/api/auth/register", { role, name, identifier, password })
        : await postJson<AuthReply>("/api/auth/login", { identifier, password });
      if (r.ok && r.data.step === "2fa") { setStep("2fa"); return; }
      if (r.ok) return finish(r.data);
      setErrors(r.data.errors ?? {});
      if (!r.data.errors) setFormError(r.data.error ?? "Something went wrong. Please try again.");
    } catch {
      setFormError("Couldn’t reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const aria = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-err` : undefined }) as const;
  const tabBtn = (t: Tab, label: string) => (
    <button
      type="button" role="tab" aria-selected={tab === t} onClick={() => switchTab(t)}
      className={`-mb-px border-b-[3px] px-5 py-3 text-[16px] font-bold ${tab === t ? "border-alert text-navy" : "border-transparent text-muted hover:text-navy"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[560px_minmax(0,1fr)]">
      <aside className="bg-navy px-8 py-10 text-white sm:px-14 lg:min-h-screen">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-alert"><Icon name="home" className="size-5" /></span>
          <span className="font-display text-[19px] font-bold leading-tight">Community Disaster<br />Resource Board</span>
        </Link>
        <h1 className="mt-14 font-display text-[40px] font-bold leading-[1.15] sm:text-[48px] lg:mt-24">Help finds people faster when it is kept current.</h1>
        <p className="mt-6 max-w-[430px] text-[18px] leading-8 text-[#c9d6e3]">
          Create an account to post shelters, supplies, rides or your time. Looking for help? You never need an account.
        </p>
      </aside>

      <main id="main" className="grid place-items-center bg-canvas px-4 py-10 sm:px-8">
        <div className="w-full max-w-[620px]">
          <div className="rounded-2xl border border-line bg-white p-6 sm:p-9">
            <div role="tablist" aria-label="Log in or create an account" className="flex border-b-2 border-line">
              {tabBtn("login", "Log in")}
              {tabBtn("register", "Create account")}
            </div>

            <form noValidate onSubmit={submit} className="mt-6 space-y-5" aria-label={tab === "login" ? "Log in" : "Create account"}>
              {step === "2fa" ? (
                <>
                  <p className="text-[16px] leading-7">Enter the 6-digit code from your authenticator app. Admin and moderator accounts always need this second step.</p>
                  <Field id="code" label="Authenticator code">
                    <input id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className={`${inputClass} tracking-[0.4em]`} />
                  </Field>
                </>
              ) : (
                <>
                  {tab === "register" && (
                    <fieldset>
                      <legend className="text-[15px] font-bold">I am registering as</legend>
                      <div className="mt-2 grid grid-cols-3 gap-3">
                        {roles.map((r) => (
                          <button
                            key={r.key} type="button" aria-pressed={role === r.key} onClick={() => setRole(r.key)}
                            className={`rounded-xl border px-2 py-5 text-[16px] font-bold ${role === r.key ? "border-navy bg-[#eef3fb] ring-2 ring-navy" : "border-line bg-white hover:border-navy"}`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                      {role === "organization" && (
                        <p className="mt-3 text-[14px] leading-6 text-muted">Your console unlocks after an admin approves your registration.</p>
                      )}
                      {errors.role && <p role="alert" className="mt-2 text-[14px] font-bold text-alert">{errors.role}</p>}
                    </fieldset>
                  )}
                  {tab === "register" && (
                    <Field id="name" label={role === "organization" ? "Organization name" : "Full name"} error={errors.name}>
                      <input id="name" type="text" autoComplete={role === "organization" ? "organization" : "name"} placeholder={role === "organization" ? "Central College Relief Centre" : "Nimali Fernando"} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} {...aria("name")} />
                    </Field>
                  )}
                  <Field id="identifier" label="Email or phone" error={errors.identifier}>
                    <input id="identifier" type="text" autoComplete="username" placeholder="077 000 0000" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className={inputClass} {...aria("identifier")} />
                  </Field>
                  <Field id="password" label="Password" hint={tab === "register" ? "At least 8 characters." : undefined} error={errors.password}>
                    <input id="password" type="password" autoComplete={tab === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} {...aria("password")} />
                  </Field>
                  {tab === "register" && (
                    <p className="text-[14px] leading-6 text-muted">Only your first name and general area appear on public listings.</p>
                  )}
                </>
              )}

              {formError && <p role="alert" className="rounded-lg border border-[#e8b4ae] bg-alert-soft p-3 text-[15px] font-bold text-alert">{formError}</p>}

              <button type="submit" disabled={busy} className="w-full rounded-lg bg-alert py-4 text-[17px] font-bold text-white hover:brightness-110 disabled:opacity-60">
                {busy ? "Please wait…" : step === "2fa" ? "Verify and log in" : tab === "login" ? "Log in" : "Create account"}
              </button>
              {step === "form" && (
                <button type="button" onClick={() => setInfo("Google sign-in isn’t set up yet. Please use your email or phone.")} className="w-full rounded-lg border-2 border-navy bg-white py-3.5 text-[16px] font-bold hover:bg-navy hover:text-white">
                  Continue with Google
                </button>
              )}
              {step === "2fa" && (
                <button type="button" onClick={() => { setStep("form"); setCode(""); setFormError(null); }} className="text-[15px] font-bold underline underline-offset-2">Back</button>
              )}
              <p role="status" className="text-[14px] text-muted">{info}</p>
            </form>
          </div>
          {footer}
        </div>
      </main>
    </div>
  );
}
