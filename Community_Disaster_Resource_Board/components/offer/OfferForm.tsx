"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { displayValue, offerConfigs, FieldDef, OfferType, Values } from "../../lib/offer-config";
import { validate } from "../../lib/request-schema";
import { getUser, DemoUser } from "../../lib/auth";
import { Field, inputClass } from "../request/ui";
import { LocationPicker } from "./LocationPicker";
import { PreviewCard } from "./PreviewCard";

type Stage = "edit" | "review" | "done";

export function OfferForm({ slug }: { slug: OfferType }) {
  const cfg = offerConfigs[slug];
  const router = useRouter();
  const pathname = usePathname();
  const draftKey = `cdrb-offer-draft-${slug}`;

  const [values, setValues] = useState<Values>(cfg.defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<Stage>("edit");
  const [reference, setReference] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<DemoUser | null>(null);
  const loaded = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstStage = useRef(true);

  /* Restore draft + read demo user */
  useEffect(() => {
    setUser(getUser());
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        setValues({ ...cfg.defaults, ...(JSON.parse(raw) as Values) });
        setNotice("We restored your saved draft.");
      }
    } catch {}
    loaded.current = true;
  }, [draftKey, cfg.defaults]);

  /* Autosave draft (after a short pause) */
  useEffect(() => {
    if (!loaded.current || stage === "done") return;
    const t = setTimeout(() => {
      try { localStorage.setItem(draftKey, JSON.stringify(values)); } catch {}
    }, 500);
    return () => clearTimeout(t);
  }, [values, stage, draftKey]);

  useEffect(() => {
    if (firstStage.current) { firstStage.current = false; return; }
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [stage]);

  function set(name: string, value: string | string[]) {
    setValues((p) => ({ ...p, [name]: value }));
    setErrors((p) => { if (!(name in p)) return p; const { [name]: _x, ...rest } = p; return rest; });
  }
  function setPin(lat: string, lng: string) {
    setValues((p) => ({ ...p, lat, lng }));
    setErrors((p) => { const { lat: _a, lng: _b, ...rest } = p; return rest; });
  }
  function startOver() {
    try { localStorage.removeItem(draftKey); } catch {}
    setValues(cfg.defaults); setErrors({}); setNotice(null);
  }

  function toReview() {
    const errs = validate(cfg.schema, { ...values, offer: slug });
    setErrors(errs);
    if (Object.keys(errs).length === 0) { setNotice(null); setStage("review"); }
  }

  async function publish() {
    if (!getUser()) {
      // Draft is already saved, so they return to exactly where they were.
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!navigator.onLine) { setNotice("You seem to be offline. Your draft is saved. Try again when you reconnect."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, offer: slug, clientId: crypto.randomUUID() }),
      });
      if (res.ok) {
        const data = (await res.json()) as { reference: string };
        try { localStorage.removeItem(draftKey); } catch {}
        setReference(data.reference);
        setStage("done");
      } else if (res.status === 400) {
        const data = (await res.json()) as { errors?: Record<string, string> };
        setErrors(data.errors ?? {});
        setNotice("Please check your answers and try again.");
        setStage("edit");
      } else {
        setNotice("Something went wrong on our side. Your draft is saved. Please try again.");
      }
    } catch {
      setNotice("Couldn’t reach the server. Your draft is saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  /* ---------- field rendering ---------- */
  function renderField(def: FieldDef, key: string) {
    if (def.kind === "map") {
      return (
        <LocationPicker
          key={key} label={def.label} lat={String(values.lat ?? "")} lng={String(values.lng ?? "")}
          error={errors.lat ?? errors.lng} onChange={setPin}
        />
      );
    }
    const id = `f-${def.name}`;
    const err = errors[def.name];
    const aria = { "aria-invalid": !!err, "aria-describedby": err ? `${id}-err` : undefined } as const;

    if (def.kind === "checks") {
      const current = (values[def.name] as string[]) ?? [];
      return (
        <fieldset key={key}>
          <legend className="text-[15px] font-bold">{def.label}</legend>
          <div className="mt-3 grid gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {def.options.map((o) => (
              <label key={o.value} className="flex cursor-pointer items-center gap-3 text-[16px]">
                <input
                  type="checkbox" checked={current.includes(o.value)} className="size-5 accent-navy"
                  onChange={() => set(def.name, current.includes(o.value) ? current.filter((x) => x !== o.value) : [...current, o.value])}
                />
                {o.label}
              </label>
            ))}
          </div>
          {err && <p role="alert" className="mt-2 text-[14px] font-bold text-alert">{err}</p>}
        </fieldset>
      );
    }

    return (
      <Field key={key} id={id} label={def.label} optional={def.kind !== "select" && def.optional} hint={def.kind !== "select" ? def.hint : undefined} error={err}>
        {def.kind === "select" ? (
          <select id={id} value={String(values[def.name] ?? "")} onChange={(e) => set(def.name, e.target.value)} className={inputClass} {...aria}>
            {def.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : def.kind === "textarea" ? (
          <textarea id={id} rows={4} value={String(values[def.name] ?? "")} placeholder={def.placeholder} onChange={(e) => set(def.name, e.target.value)} className={inputClass} {...aria} />
        ) : (
          <input
            id={id} type="text" inputMode={def.kind === "number" ? "numeric" : undefined}
            value={String(values[def.name] ?? "")} placeholder={def.placeholder}
            onChange={(e) => set(def.name, e.target.value)} className={inputClass} {...aria}
          />
        )}
      </Field>
    );
  }

  // Pair consecutive "half" fields into two-column rows.
  const rows: FieldDef[][] = [];
  for (const f of cfg.fields) {
    const last = rows[rows.length - 1];
    const half = "half" in f && f.half;
    if (half && last && last.length === 1 && "half" in last[0] && last[0].half) last.push(f);
    else rows.push([f]);
  }

  const preview = cfg.preview(values);
  const hasErrors = Object.keys(errors).length > 0;

  /* ---------- screens ---------- */
  let body: React.ReactNode;
  if (stage === "done") {
    body = (
      <>
        <h1 ref={headingRef} tabIndex={-1} className="font-display text-[36px] font-bold leading-tight outline-none sm:text-[42px]">Submitted for a quick check</h1>
        <p className="mt-3 text-[17px]">Your reference is <strong>{reference}</strong>.</p>
        <p className="mt-3 text-[16px] leading-7 text-muted">
          Moderators usually review within 30 minutes. Once it is live, you can change beds or status in one tap from your dashboard.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/board" className="rounded-lg bg-navy px-6 py-3.5 font-bold text-white hover:bg-navy-soft">Open the board</Link>
          <Link href="/offer-help" className="rounded-lg border-2 border-navy px-6 py-3 font-bold hover:bg-navy hover:text-white">Post something else</Link>
        </div>
      </>
    );
  } else if (stage === "review") {
    body = (
      <>
        <h1 ref={headingRef} tabIndex={-1} className="font-display text-[36px] font-bold leading-tight outline-none sm:text-[42px]">Check your listing</h1>
        <p className="mt-2 text-[17px] text-muted">This is what people will see. Publish when it looks right.</p>
        <dl className="mt-6 space-y-3">
          {cfg.fields.map((f, i) => (
            <div key={i} className="grid gap-1 border-b border-line pb-3 sm:grid-cols-[200px_1fr]">
              <dt className="text-[14px] font-bold text-muted">{f.label}</dt>
              <dd className="text-[16px]">{displayValue(f, values)}</dd>
            </div>
          ))}
        </dl>
        {!user && (
          <p className="mt-5 rounded-lg bg-[#eef3fb] p-4 text-[15px]">You’ll be asked to log in when you publish. Your answers stay saved.</p>
        )}
        {notice && <p role="status" className="mt-4 text-[15px] font-bold text-alert">{notice}</p>}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => setStage("edit")} className="rounded-lg border-2 border-navy px-6 py-3 text-[16px] font-bold hover:bg-navy hover:text-white">Edit</button>
          <button type="button" onClick={publish} disabled={busy} className="rounded-lg bg-alert px-8 py-4 text-[18px] font-bold text-white hover:brightness-110 disabled:opacity-60">
            {busy ? "Publishing…" : "Publish listing"}
          </button>
        </div>
      </>
    );
  } else {
    body = (
      <>
        <h1 ref={headingRef} tabIndex={-1} className="font-display text-[36px] font-bold leading-tight outline-none sm:text-[42px]">{cfg.title}</h1>
        <p className="mt-2 text-[16px] text-muted">{cfg.intro}</p>
        {notice && (
          <p role="status" className="mt-3 flex flex-wrap items-center gap-3 text-[14px] text-muted">
            {notice}
            {notice.startsWith("We restored") && (
              <button type="button" onClick={startOver} className="font-bold text-navy underline underline-offset-2">Start over</button>
            )}
          </p>
        )}
        <form noValidate onSubmit={(e) => { e.preventDefault(); toReview(); }} className="mt-6 space-y-6">
          {rows.map((row, i) =>
            row.length === 2 ? (
              <div key={i} className="grid gap-4 sm:grid-cols-2">{row.map((f, j) => renderField(f, `${i}-${j}`))}</div>
            ) : (
              <div key={i}>{renderField(row[0], `${i}`)}</div>
            ),
          )}
          {hasErrors && (
            <p role="alert" className="rounded-lg border border-[#e8b4ae] bg-alert-soft p-3 text-[15px] font-bold text-alert">
              Please fix the highlighted answers to continue.
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => { try { localStorage.setItem(draftKey, JSON.stringify(values)); setNotice("Draft saved on this device only."); } catch {} }}
              className="rounded-lg border-2 border-navy px-6 py-3 text-[16px] font-bold hover:bg-navy hover:text-white"
            >
              Save draft
            </button>
            <button type="submit" className="rounded-lg bg-alert px-8 py-3.5 text-[17px] font-bold text-white hover:brightness-110">Preview listing</button>
          </div>
        </form>
      </>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,860px)_minmax(0,1fr)] lg:gap-7">
      <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">{body}</div>
      <aside className="space-y-4">
        <div>
          <p className="mb-2 text-[14px] font-bold text-muted">How it will look on the board</p>
          <PreviewCard category={cfg.category} {...preview} verified={!!user?.org} />
        </div>
        <section className="rounded-xl border border-line bg-white p-6">
          <h2 className="text-[17px] font-bold">Before it goes live</h2>
          <p className="mt-3 text-[14px] leading-7 text-muted">
            Organizations upload a registration document for the verified badge. Moderators usually review within 30 minutes. After publishing, change beds or status in one tap from your dashboard.
          </p>
        </section>
      </aside>
    </div>
  );
}
