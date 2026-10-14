import { steps } from "../lib/data";

export function HowItWorks() {
  return (
    <section aria-label="How it works" className="mb-16 mt-14">
      <ol className="grid gap-4 lg:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex items-center gap-5 rounded-xl border border-line bg-white p-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-navy font-display text-[20px] font-bold text-white">
              {i + 1}
            </span>
            <div>
              <h3 className="text-[18px] font-bold">{s.title}</h3>
              <p className="mt-1 text-[16px] leading-7 text-muted">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
