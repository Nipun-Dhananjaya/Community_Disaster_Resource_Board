import { needsByCategory, needsLabel, type Category } from "../../lib/listings";

const windows = [
  { min: 60, label: "1 h" },
  { min: 360, label: "6 h" },
  { min: 1440, label: "24 h" },
];

export function FiltersPanel({
  category, distance, setDistance, needs, toggleNeed, verifiedOnly, setVerifiedOnly, within, setWithin, resultCount, onDone,
}: {
  category: Category | "all";
  distance: number;
  setDistance: (n: number) => void;
  needs: string[];
  toggleNeed: (key: string) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (v: boolean) => void;
  within: number;
  setWithin: (n: number) => void;
  resultCount: number;
  onDone: () => void;
}) {
  const options = category === "all" ? [] : needsByCategory[category];

  return (
    <section aria-labelledby="filters-h" className="rounded-xl border border-line bg-white p-6">
      <h2 id="filters-h" className="font-display text-[24px] font-bold">Filters</h2>

      <div className="mt-4">
        <label htmlFor="distance" className="text-[15px] font-bold text-muted">Distance</label>
        <input
          id="distance" type="range" min={1} max={50} step={1} value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          className="mt-3 h-2 w-full cursor-pointer accent-navy"
        />
        <p className="mt-2 text-[14px] text-muted">Within {distance} km</p>
      </div>

      {options.length > 0 && (
        <fieldset className="mt-5">
          <legend className="text-[15px] font-bold text-muted">{needsLabel[category as Category]}</legend>
          <div className="mt-3 space-y-3">
            {options.map((o) => (
              <label key={o.key} className="flex cursor-pointer items-center gap-3 text-[16px]">
                <input type="checkbox" checked={needs.includes(o.key)} onChange={() => toggleNeed(o.key)} className="size-5 cursor-pointer accent-navy" />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="mt-5">
        <legend className="text-[15px] font-bold text-muted">Trust</legend>
        <label className="mt-3 flex cursor-pointer items-center gap-3 text-[16px]">
          <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="size-5 cursor-pointer accent-navy" />
          Verified only
        </label>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-[15px] font-bold text-muted">Updated within</legend>
        <div className="mt-3 flex gap-2">
          {windows.map((w) => (
            <button
              key={w.min} type="button" aria-pressed={within === w.min} onClick={() => setWithin(w.min)}
              className={`rounded-full border px-4 py-1.5 text-[15px] font-bold ${within === w.min ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-navy"}`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </fieldset>

      <button type="button" onClick={onDone} className="mt-6 w-full rounded-lg bg-navy py-4 text-[17px] font-bold text-white hover:bg-navy-soft">
        Show {resultCount} {resultCount === 1 ? "result" : "results"}
      </button>
    </section>
  );
}
