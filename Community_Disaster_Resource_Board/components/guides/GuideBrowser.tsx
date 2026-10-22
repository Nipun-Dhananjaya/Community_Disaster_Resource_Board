"use client";

import { useEffect, useState } from "react";
import { emergencyContacts, guideNote, guides, Guide, HazardKey } from "../../lib/guides";

const KEY = "cdrb-guide-checks";

export function GuideBrowser() {
  const [selected, setSelected] = useState<HazardKey>("flood");
  const [query, setQuery] = useState("");
  const [checks, setChecks] = useState<Record<string, string[]>>({});

  useEffect(() => {
    try { setChecks(JSON.parse(localStorage.getItem(KEY) ?? "{}")); } catch {}
  }, []);

  const q = query.trim().toLowerCase();
  const matches = q
    ? guides.filter((g) => [g.label, g.heading, g.keywords, ...g.before, ...g.during, ...g.after].join(" ").toLowerCase().includes(q))
    : guides;
  const active: Guide | undefined = matches.find((g) => g.key === selected) ?? matches[0];

  function toggle(id: string) {
    if (!active) return;
    setChecks((prev) => {
      const cur = prev[active.key] ?? [];
      const next = { ...prev, [active.key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  const columns = active && [
    { id: "before", title: "Before", items: active.before, top: "border-t-ok" },
    { id: "during", title: "During", items: active.during, top: "border-t-alert" },
    { id: "after", title: "After", items: active.after, top: "border-t-navy" },
  ];

  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="flex max-w-[760px] items-center gap-2 rounded-xl border border-line bg-white p-2 pl-5">
        <label htmlFor="g-q" className="sr-only">Search a hazard or topic</label>
        <input id="g-q" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a hazard or topic" className="min-w-0 flex-1 bg-transparent py-3 text-[16px] placeholder:text-muted focus:outline-none" />
        <button type="submit" className="rounded-lg bg-navy px-6 py-3 text-[16px] font-bold text-white hover:bg-navy-soft">Search</button>
      </form>

      {matches.length === 0 ? (
        <p role="status" className="mt-6 rounded-xl border border-line bg-white p-6 text-[16px] text-muted">
          No guide matches “{query}”. Try flood, fire or earthquake.
        </p>
      ) : (
        <div role="group" aria-label="Hazards" className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {matches.map((g) => {
            const on = active?.key === g.key;
            return (
              <button key={g.key} type="button" aria-pressed={on} onClick={() => setSelected(g.key)}
                className={`flex flex-col items-center gap-3 rounded-xl border bg-white px-3 py-6 text-[16px] font-bold ${on ? "border-navy bg-[#eef3fb] ring-2 ring-navy" : "border-line hover:border-navy"}`}>
                <span aria-hidden="true" className="grid size-10 place-items-center rounded-lg bg-navy text-[18px] text-white">{g.glyph}</span>
                {g.label}
              </button>
            );
          })}
        </div>
      )}

      {active && columns && (
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section aria-labelledby="guide-h">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="guide-h" className="font-display text-[28px] font-bold">{active.heading}</h2>
              <a href={`/api/guides/${active.key}/pdf`} download className="rounded-lg border-2 border-navy bg-white px-4 py-2.5 text-[14px] font-bold hover:bg-navy hover:text-white">
                Download PDF for offline
              </a>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {columns.map((c) => (
                <div key={c.id} className={`rounded-xl border border-t-[5px] border-line bg-white p-5 ${c.top}`}>
                  <h3 className="font-display text-[22px] font-bold">{c.title}</h3>
                  <ul className="mt-3 space-y-3">
                    {c.items.map((item, i) => {
                      const id = `${c.id}-${i}`;
                      return (
                        <li key={id}>
                          <label className="flex cursor-pointer items-start gap-3 text-[16px] leading-6">
                            <input type="checkbox" checked={(checks[active.key] ?? []).includes(id)} onChange={() => toggle(id)} className="mt-0.5 size-5 shrink-0 accent-navy" />
                            {item}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[14px] text-muted">Ticks are saved on this device. {guideNote}</p>
          </section>

          <aside aria-labelledby="ec-h" className="rounded-xl border border-line bg-white p-6">
            <h2 id="ec-h" className="font-display text-[24px] font-bold">Emergency contacts</h2>
            <ul className="mt-3 divide-y divide-line border-t border-line">
              {emergencyContacts.map((c) => (
                <li key={c.number} className="flex items-center justify-between gap-3 py-4">
                  <span className="text-[17px] font-bold">{c.label}</span>
                  <a href={`tel:${c.number}`} aria-label={`Call ${c.label} on ${c.number}`} className="rounded-lg bg-ok px-4 py-2 text-[15px] font-bold text-white hover:brightness-110">Call {c.number}</a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
}
