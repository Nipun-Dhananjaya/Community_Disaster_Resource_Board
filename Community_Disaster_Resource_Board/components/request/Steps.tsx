import { useState } from "react";
import {
  contactOptions, needOptions, specialOptions, urgencyOptions,
  type FormValues, type NeedKey, type SpecialKey,
} from "@/lib/request-schema";
import { Icon } from "../Icon";
import { Field, inputClass } from "./ui";

export type StepProps = {
  values: FormValues;
  errors: Record<string, string>;
  set: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void;
};

/* ---------- Step 1 ---------- */
export function NeedStep({ values, errors, set }: StepProps) {
  const toggle = (k: NeedKey) =>
    set("needs", values.needs.includes(k) ? values.needs.filter((x) => x !== k) : [...values.needs, k]);

  return (
    <div>
      <div role="group" aria-labelledby="step-heading" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {needOptions.map((o) => {
          const on = values.needs.includes(o.key);
          return (
            <button
              key={o.key}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(o.key)}
              className={`relative flex min-h-[138px] flex-col items-center justify-center gap-3 rounded-xl border bg-white p-4 text-center text-[16px] font-bold ${
                on ? "border-navy bg-[#eaf1fb] ring-2 ring-navy" : "border-line hover:border-navy"
              }`}
            >
              {on && <span aria-hidden="true" className="absolute right-3.5 top-2 text-[15px]">✓</span>}
              <span className={`grid size-[52px] place-items-center rounded-lg text-white ${o.bg}`}>
                <Icon name={o.icon} className="size-6" />
              </span>
              {o.label}
            </button>
          );
        })}
      </div>
      {errors.needs && <p role="alert" className="mt-3 text-[15px] font-bold text-alert">{errors.needs}</p>}
      {values.needs.includes("rescue") && (
        <p className="mt-4 rounded-lg border border-[#e8b4ae] bg-alert-soft p-4 text-[15px]">
          <strong>Rescue:</strong> if anyone is in immediate danger, call 119 now. Responders will also see your request.
        </p>
      )}
    </div>
  );
}

/* ---------- Step 2 ---------- */
export function DetailsStep({ values, errors, set }: StepProps) {
  const toggle = (k: SpecialKey) =>
    set("special", values.special.includes(k) ? values.special.filter((x) => x !== k) : [...values.special, k]);

  return (
    <div className="space-y-7">
      <fieldset>
        <legend className="text-[16px] font-bold">How urgent is it?</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {urgencyOptions.map((o) => {
            const on = values.urgency === o.key;
            return (
              <label key={o.key} className={`flex cursor-pointer gap-3 rounded-xl border bg-white p-4 ${on ? "border-navy bg-[#eaf1fb] ring-2 ring-navy" : "border-line hover:border-navy"}`}>
                <input type="radio" name="urgency" value={o.key} checked={on} onChange={() => set("urgency", o.key)} className="mt-1 size-5 accent-navy" />
                <span>
                  <span className="block text-[16px] font-bold">{o.label}</span>
                  <span className="block text-[14px] text-muted">{o.hint}</span>
                </span>
              </label>
            );
          })}
        </div>
        {errors.urgency && <p role="alert" className="mt-2 text-[14px] font-bold text-alert">{errors.urgency}</p>}
      </fieldset>

      <div className="max-w-[220px]">
        <Field id="people" label="How many people need help?" error={errors.people}>
          <input
            id="people" type="number" inputMode="numeric" min={1} max={99}
            value={values.people} onChange={(e) => set("people", e.target.value)}
            aria-invalid={!!errors.people} aria-describedby={errors.people ? "people-err" : undefined}
            className={inputClass}
          />
        </Field>
      </div>

      <fieldset>
        <legend className="text-[16px] font-bold">Anyone with special needs? <span className="font-normal text-muted">(optional)</span></legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {specialOptions.map((o) => (
            <label key={o.key} className="flex cursor-pointer items-center gap-3 text-[16px]">
              <input type="checkbox" checked={values.special.includes(o.key)} onChange={() => toggle(o.key)} className="size-5 accent-navy" />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Field id="notes" label="Anything else responders should know?" optional error={errors.notes}>
        <textarea
          id="notes" rows={4} maxLength={300} value={values.notes} onChange={(e) => set("notes", e.target.value)}
          aria-invalid={!!errors.notes} aria-describedby={errors.notes ? "notes-err" : "notes-count"}
          className={inputClass}
        />
        <p id="notes-count" className="mt-1 text-right text-[13px] text-muted">{values.notes.length} / 300</p>
      </Field>
    </div>
  );
}

/* ---------- Step 3 ---------- */
export function LocationStep({ values, errors, set }: StepProps) {
  const [geo, setGeo] = useState<string | null>(null);

  function locate() {
    if (!("geolocation" in navigator)) return setGeo("Your browser can’t share location. Type your area instead.");
    setGeo("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("lat", Number(pos.coords.latitude.toFixed(5)));
        set("lng", Number(pos.coords.longitude.toFixed(5)));
        setGeo("Location added. Please still type your town or area below.");
      },
      () => setGeo("Couldn’t get your location. Type your area instead."),
      { timeout: 8000 },
    );
  }

  return (
    <div className="space-y-7">
      <section aria-labelledby="where-h" className="space-y-4">
        <h3 id="where-h" className="text-[18px] font-bold">Where are you?</h3>
        <Field id="area" label="Town or area" error={errors.area}>
          <input
            id="area" type="text" autoComplete="address-level2" value={values.area} onChange={(e) => set("area", e.target.value)}
            aria-invalid={!!errors.area} aria-describedby={errors.area ? "area-err" : undefined} className={inputClass}
          />
        </Field>
        <Field id="landmark" label="Street or landmark" optional hint="For example, near the temple on Station Road." error={errors.landmark}>
          <input id="landmark" type="text" value={values.landmark} onChange={(e) => set("landmark", e.target.value)} aria-describedby="landmark-hint" className={inputClass} />
        </Field>
        <div>
          <button type="button" onClick={locate} className="rounded-lg border-2 border-navy px-4 py-2.5 text-[15px] font-bold hover:bg-navy hover:text-white">
            Use my location
          </button>
          <p role="status" className="mt-2 text-[14px] text-muted">
            {geo ?? (values.lat !== null ? "Location added." : "Optional. Helps responders find you faster.")}
          </p>
        </div>
      </section>

      <section aria-labelledby="who-h" className="space-y-4">
        <h3 id="who-h" className="text-[18px] font-bold">How can responders reach you?</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Your name" error={errors.name}>
            <input
              id="name" type="text" autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)}
              aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} className={inputClass}
            />
          </Field>
          <Field id="phone" label="Phone number" error={errors.phone}>
            <input
              id="phone" type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)}
              aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-err" : undefined} className={inputClass}
            />
          </Field>
        </div>
        <fieldset>
          <legend className="text-[16px] font-bold">Best way to reach you</legend>
          <div className="mt-2 flex flex-wrap gap-6">
            {contactOptions.map((o) => (
              <label key={o.key} className="flex cursor-pointer items-center gap-2 text-[16px]">
                <input type="radio" name="contact" checked={values.contact === o.key} onChange={() => set("contact", o.key)} className="size-5 accent-navy" />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label className="flex cursor-pointer items-start gap-3 text-[15px]">
            <input
              type="checkbox" checked={values.consent} onChange={(e) => set("consent", e.target.checked)}
              aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "consent-err" : undefined}
              className="mt-1 size-5 shrink-0 accent-navy"
            />
            I agree that my name and phone number can be shared with verified responders.
          </label>
          {errors.consent && <p id="consent-err" role="alert" className="mt-1.5 text-[14px] font-bold text-alert">{errors.consent}</p>}
        </div>
      </section>
    </div>
  );
}

/* ---------- Step 4 ---------- */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[170px_1fr]">
      <dt className="text-[14px] font-bold text-muted">{label}</dt>
      <dd className="text-[16px]">{children}</dd>
    </div>
  );
}

export function ReviewStep({ values, onEdit }: { values: FormValues; onEdit: (step: number) => void }) {
  const needLabels = needOptions.filter((n) => values.needs.includes(n.key)).map((n) => n.label).join(", ");
  const urgency = urgencyOptions.find((u) => u.key === values.urgency)?.label ?? "";
  const special = specialOptions.filter((s) => values.special.includes(s.key)).map((s) => s.label).join(", ") || "None";
  const contact = contactOptions.find((c) => c.key === values.contact)?.label ?? "";

  const Card = ({ title, step, children }: { title: string; step: number; children: React.ReactNode }) => (
    <section className="rounded-xl border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[18px] font-bold">{title}</h3>
        <button type="button" onClick={() => onEdit(step)} className="text-[15px] font-bold underline underline-offset-2">Edit</button>
      </div>
      <dl className="mt-3 space-y-2">{children}</dl>
    </section>
  );

  return (
    <div className="space-y-4">
      <Card title="Your need" step={0}>
        <Row label="You need">{needLabels}</Row>
      </Card>
      <Card title="Details" step={1}>
        <Row label="Urgency">{urgency}</Row>
        <Row label="People">{values.people}</Row>
        <Row label="Special needs">{special}</Row>
        {values.notes && <Row label="Notes">{values.notes}</Row>}
      </Card>
      <Card title="Location and contact" step={2}>
        <Row label="Area">{values.area}{values.landmark && `, ${values.landmark}`}</Row>
        {values.lat !== null && <Row label="Exact location">Shared with verified responders</Row>}
        <Row label="Name">{values.name}</Row>
        <Row label="Phone">{values.phone}</Row>
        <Row label="Reach you by">{contact}</Row>
      </Card>
      <p className="text-[14px] text-muted">
        The public board shows only what you need and your general area. Your name and phone go to verified responders.
      </p>
    </div>
  );
}
