"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  emptyValues, fullSchema, stepSchemas, validate, type FormValues,
} from "@/lib/request-schema";
import { DetailsStep, LocationStep, NeedStep, ReviewStep } from "./Steps";
import { Progress } from "./ui";

const DRAFT_KEY = "cdrb-request-draft";
const OUTBOX_KEY = "cdrb-request-outbox";

const labels = ["Your need", "Details", "Location and contact", "Review"];
const titles = ["What do you need?", "Tell us more", "Where are you, and how can we reach you?", "Check and send"];
const subtitles = [
  "Pick everything that applies. You do not need an account.",
  "A few details help responders bring the right help.",
  "We only share your name and phone with verified responders.",
  "Make sure everything is right, then send your request.",
];
const nextLabels = ["Next: add details", "Next: location and contact", "Next: review"];

type Result = { kind: "sent"; reference: string } | { kind: "queued" };
type Queued = Record<string, unknown> & { clientId: string };

function readOutbox(): Queued[] {
  try { return JSON.parse(localStorage.getItem(OUTBOX_KEY) ?? "[]"); } catch { return []; }
}
function writeOutbox(items: Queued[]) {
  try { localStorage.setItem(OUTBOX_KEY, JSON.stringify(items)); } catch {}
}

export function RequestForm() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);

  /* Restore a saved draft */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { values: FormValues; step: number };
        setValues({ ...emptyValues, ...d.values });
        setStep(Math.min(Math.max(d.step ?? 0, 0), 3));
        setNotice("We restored your saved draft.");
      }
    } catch {}
  }, []);

  /* Send anything saved while offline */
  const flushOutbox = useCallback(async () => {
    const queue = readOutbox();
    if (queue.length === 0) return;
    const remaining: Queued[] = [];
    for (const item of queue) {
      try {
        const res = await fetch("/api/requests", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item),
        });
        if (!res.ok && res.status !== 400) remaining.push(item); // 400 = invalid, drop it
      } catch {
        remaining.push(item);
      }
    }
    writeOutbox(remaining);
  }, []);

  useEffect(() => {
    if (navigator.onLine) flushOutbox();
    window.addEventListener("online", flushOutbox);
    return () => window.removeEventListener("online", flushOutbox);
  }, [flushOutbox]);

  /* Move focus to the heading when the step changes */
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [step, result]);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((p) => ({ ...p, [key]: value }));
    setErrors((p) => { if (!(key in p)) return p; const { [key as string]: _drop, ...rest } = p; return rest; });
  }

  function saveDraft() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ values, step }));
      setNotice("Draft saved on this device only.");
    } catch {
      setNotice("Couldn’t save a draft on this device.");
    }
  }

  function startOver() {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setValues(emptyValues); setStep(0); setErrors({}); setNotice(null);
  }

  function next() {
    const errs = validate(stepSchemas[step], values);
    setErrors(errs);
    if (Object.keys(errs).length === 0) { setNotice(null); setStep(step + 1); }
  }

  async function submit() {
    // Re-check every step so nothing slips through after edits.
    for (let i = 0; i < 3; i++) {
      const errs = validate(stepSchemas[i], values);
      if (Object.keys(errs).length > 0) { setErrors(errs); setStep(i); return; }
    }
    const parsed = fullSchema.parse(values);
    const payload: Queued = { ...parsed, clientId: crypto.randomUUID(), submittedAt: new Date().toISOString() };

    const queue = () => {
      writeOutbox([...readOutbox(), payload]);
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      setResult({ kind: "queued" });
    };

    setSubmitting(true);
    if (!navigator.onLine) { queue(); setSubmitting(false); return; }
    try {
      const res = await fetch("/api/requests", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = (await res.json()) as { reference: string };
        try { localStorage.removeItem(DRAFT_KEY); } catch {}
        setResult({ kind: "sent", reference: data.reference });
      } else if (res.status === 400) {
        const data = (await res.json()) as { errors?: Record<string, string> };
        setErrors(data.errors ?? {});
        setNotice("Please check your answers and try again.");
        setStep(0);
      } else {
        queue();
      }
    } catch {
      queue();
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- Done screen ---------- */
  if (result) {
    return (
      <section aria-labelledby="done-h" className="rounded-xl border border-line bg-white p-7">
        <h2 id="done-h" ref={headingRef} tabIndex={-1} className="font-display text-[34px] font-bold outline-none">
          {result.kind === "sent" ? "Your request was sent" : "Saved on this phone"}
        </h2>
        {result.kind === "sent" ? (
          <>
            <p className="mt-3 text-[17px]">Your reference is <strong className="font-bold">{result.reference}</strong>. Keep it in case you need to follow up.</p>
            <p className="mt-3 text-[16px] leading-7 text-muted">Verified responders near you can now see your request. Keep your phone on and charged.</p>
          </>
        ) : (
          <p className="mt-3 text-[17px] leading-8">
            You seem to be offline. Your request is saved on this phone and will be sent automatically when you reconnect. Keep this page open if you can.
          </p>
        )}
        <p className="mt-4 rounded-lg bg-alert-soft p-4 text-[15px]"><strong>If life is in danger, call 119 now.</strong></p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/board" className="rounded-lg bg-navy px-6 py-3.5 font-bold text-white hover:bg-navy-soft">See shelters and supplies near you</Link>
          <Link href="/safety-guides" className="rounded-lg border-2 border-navy px-6 py-3 font-bold hover:bg-navy hover:text-white">Safety guides</Link>
        </div>
      </section>
    );
  }

  const stepProps = { values, errors, set };
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div>
      <Progress step={step} labels={labels} />

      <h2 ref={headingRef} id="step-heading" tabIndex={-1} className="mt-8 font-display text-[36px] font-bold leading-tight outline-none sm:text-[40px]">
        {titles[step]}
      </h2>
      <p className="mt-2 text-[17px] text-muted">{subtitles[step]}</p>

      {notice && (
        <p role="status" className="mt-4 flex flex-wrap items-center gap-3 text-[14px] text-muted">
          {notice}
          {notice.startsWith("We restored") && (
            <button type="button" onClick={startOver} className="font-bold text-navy underline underline-offset-2">Start over</button>
          )}
        </p>
      )}

      <form noValidate onSubmit={(e) => e.preventDefault()} className="mt-6">
        {step === 0 && <NeedStep {...stepProps} />}
        {step === 1 && <DetailsStep {...stepProps} />}
        {step === 2 && <LocationStep {...stepProps} />}
        {step === 3 && <ReviewStep values={values} onEdit={setStep} />}

        {hasErrors && step < 3 && (
          <p role="alert" className="mt-5 rounded-lg border border-[#e8b4ae] bg-alert-soft p-3 text-[15px] font-bold text-alert">
            Please fix the highlighted answers to continue.
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            {step > 0 && (
              <button type="button" onClick={() => { setErrors({}); setStep(step - 1); }} className="rounded-lg px-4 py-3 text-[16px] font-bold underline underline-offset-4">
                Back
              </button>
            )}
            <button type="button" onClick={saveDraft} className="rounded-lg border-2 border-navy bg-white px-5 py-3 text-[16px] font-bold hover:bg-navy hover:text-white">
              Save draft
            </button>
          </div>
          {step < 3 ? (
            <button type="button" onClick={next} className="rounded-lg bg-alert px-8 py-4 text-[18px] font-bold text-white hover:brightness-110">
              {nextLabels[step]}
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={submitting} className="rounded-lg bg-alert px-8 py-4 text-[18px] font-bold text-white hover:brightness-110 disabled:opacity-60">
              {submitting ? "Sending…" : "Send request"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
