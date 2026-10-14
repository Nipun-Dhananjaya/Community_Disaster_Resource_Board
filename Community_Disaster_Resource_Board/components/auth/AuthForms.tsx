"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { safeNext, setUser } from "../../lib/auth";
import { validate } from "../../lib/request-schema";
import { Field, inputClass } from "../request/ui";

const email = z.string().trim().email("Enter a valid email address");
const loginSchema = z.object({ email, password: z.string().min(1, "Enter your password") });
const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email,
  password: z.string().min(8, "Use at least 8 characters"),
  type: z.enum(["individual", "organization"]),
});

function DemoNote() {
  return (
    <p className="mt-5 rounded-lg bg-[#eef3fb] p-3 text-[13px] leading-6 text-muted">
      Demo sign-in: no password is checked or stored yet. Your name is kept in this browser only until real accounts are connected.
    </p>
  );
}

export function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [v, setV] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(loginSchema, v);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setUser({ name: v.email.split("@")[0], email: v.email.trim(), org: false });
    router.push(next);
  }

  return (
    <form noValidate onSubmit={submit} className="space-y-5">
      <Field id="email" label="Email" error={errors.email}>
        <input id="email" type="email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-err" : undefined} className={inputClass} />
      </Field>
      <Field id="password" label="Password" error={errors.password}>
        <input id="password" type="password" autoComplete="current-password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-err" : undefined} className={inputClass} />
      </Field>
      <button type="submit" className="w-full rounded-lg bg-navy py-3.5 text-[17px] font-bold text-white hover:bg-navy-soft">Log in</button>
      <p className="text-center text-[15px]">
        New here? <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-bold underline underline-offset-2">Create an account</Link>
      </p>
      <DemoNote />
    </form>
  );
}

export function SignupForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [v, setV] = useState({ name: "", email: "", password: "", type: "individual" as "individual" | "organization" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(signupSchema, v);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setUser({ name: v.name.trim(), email: v.email.trim(), org: v.type === "organization" });
    router.push(next);
  }

  return (
    <form noValidate onSubmit={submit} className="space-y-5">
      <Field id="name" label="Your name" error={errors.name}>
        <input id="name" type="text" autoComplete="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} className={inputClass} />
      </Field>
      <Field id="email" label="Email" error={errors.email}>
        <input id="email" type="email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-err" : undefined} className={inputClass} />
      </Field>
      <Field id="password" label="Password" hint="At least 8 characters." error={errors.password}>
        <input id="password" type="password" autoComplete="new-password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-err" : "password-hint"} className={inputClass} />
      </Field>
      <fieldset>
        <legend className="text-[16px] font-bold">I am posting as</legend>
        <div className="mt-2 space-y-2">
          {([["individual", "An individual"], ["organization", "An organization (can add a verified badge)"]] as const).map(([key, text]) => (
            <label key={key} className="flex cursor-pointer items-center gap-3 text-[16px]">
              <input type="radio" name="type" checked={v.type === key} onChange={() => setV({ ...v, type: key })} className="size-5 accent-navy" />
              {text}
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" className="w-full rounded-lg bg-navy py-3.5 text-[17px] font-bold text-white hover:bg-navy-soft">Create account</button>
      <p className="text-center text-[15px]">
        Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold underline underline-offset-2">Log in</Link>
      </p>
      <DemoNote />
    </form>
  );
}
