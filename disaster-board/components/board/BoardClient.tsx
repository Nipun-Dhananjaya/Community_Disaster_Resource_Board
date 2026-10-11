"use client";

import { useEffect, useMemo, useState } from "react";
import { categoryMeta, categoryOrder, listings, Category } from "/lib/listings";
import { FiltersPanel } from "./FiltersPanel";
import { ListingCard } from "./ListingCard";
import dynamic from "next/dynamic";
import type { Area } from "./BoardMapLive";

// Leaflet needs the browser, so the map is loaded on the client only.
const BoardMap = dynamic(() => import("./BoardMapLive").then((m) => m.BoardMapLive), {
  ssr: false,
  loading: () => <div className="h-[420px] rounded-2xl border border-line bg-white lg:h-[762px]" />,
});

type Sort = "nearest" | "recent";
const SAVED_KEY = "cdrb-saved";

export function BoardClient({ initialQuery, initialCategory }: { initialQuery: string; initialCategory: Category }) {
  const [category, setCategory] = useState<Category | "all">(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [distance, setDistance] = useState(10);
  const [needs, setNeeds] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [within, setWithin] = useState(60);
  const [sort, setSort] = useState<Sort>("nearest");
  const [saved, setSaved] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [area, setArea] = useState<Area | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]")); } catch {}
  }, []);

  function toggleSaved(id: string) {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function chooseCategory(c: Category | "all") {
    setCategory(c);
    setNeeds([]);
  }

  function useMyLocation() {
    if (!("geolocation" in navigator)) return setNote("Your browser can’t share location. Type a town instead.");
    setNote("Finding your location…");
    navigator.geolocation.getCurrentPosition(
        () => { setSort("nearest"); setQuery(""); setNote("Sorted by distance from you. Demo distances are fixed until a live data source is connected."); },
        () => setNote("Couldn’t get your location. Type a town or postcode instead."),
        { timeout: 8000 },
    );
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings
        .filter((l) => category === "all" || l.category === category)
        .filter((l) => l.distanceKm <= distance)
        .filter((l) => l.updatedMin <= within)
        .filter((l) => !verifiedOnly || l.verified)
        .filter((l) => needs.every((n) => l.tags.includes(n)))
        .filter((l) => !area || (l.lat >= area.south && l.lat <= area.north && l.lng >= area.west && l.lng <= area.east))
        .filter((l) => !q || `${l.title} ${l.area} ${l.headline}`.toLowerCase().includes(q))
        .sort((a, b) => (sort === "nearest" ? a.distanceKm - b.distanceKm : a.updatedMin - b.updatedMin));
  }, [category, query, distance, needs, verifiedOnly, within, sort, area]);

  const noun = category === "all"
      ? (results.length === 1 ? "listing" : "listings")
      : categoryMeta[category][results.length === 1 ? "one" : "many"];

  function selectFromMap(id: string) {
    setActiveId(id);
    document.getElementById(`listing-${id}`)?.scrollIntoView({ block: "nearest" });
  }

  function resetFilters() {
    setQuery(""); setArea(null); setDistance(50); setNeeds([]); setVerifiedOnly(false); setWithin(1440);
  }

  return (
      <div>
        <form role="search" onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4 md:flex-row md:items-center">
          <label htmlFor="q" className="sr-only">Search by place, postcode or keyword</label>
          <input
              id="q" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by place, postcode or keyword"
              className="min-w-0 flex-1 rounded-lg border border-line px-4 py-3 text-[16px] placeholder:text-muted"
          />
          <button type="button" onClick={useMyLocation} className="rounded-lg border-2 border-navy px-5 py-2.5 text-[16px] font-bold hover:bg-navy hover:text-white">
            Use my location
          </button>
          <label className="sr-only" htmlFor="sort">Sort results</label>
          <select
              id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-lg border border-line bg-white px-4 py-3 text-[16px]"
          >
            <option value="nearest">Sort: Nearest</option>
            <option value="recent">Sort: Recently updated</option>
          </select>
        </form>
        {note && <p role="status" className="mt-2 text-[14px] text-muted">{note}</p>}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Category">
            {(["all", ...categoryOrder] as const).map((c) => {
              const on = category === c;
              return (
                  <button
                      key={c} type="button" aria-pressed={on} onClick={() => chooseCategory(c)}
                      className={`rounded-full border px-5 py-2 text-[15px] font-bold ${on ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-navy"}`}
                  >
                    {c === "all" ? "All" : categoryMeta[c].chip}
                  </button>
              );
            })}
          </div>
          <p role="status" className="flex items-center gap-3 text-[14px] text-muted">
            {results.length} {noun} within {distance} km
            {area && (
                <button type="button" onClick={() => setArea(null)} className="font-bold text-navy underline underline-offset-2">
                  Clear map area
                </button>
            )}
          </p>
        </div>

        <button
            type="button" aria-expanded={filtersOpen} aria-controls="filters"
            onClick={() => setFiltersOpen((v) => !v)}
            className="mt-5 w-full rounded-lg border-2 border-navy bg-white px-4 py-3 font-bold xl:hidden"
        >
          {filtersOpen ? "Hide filters" : "Show filters"}
        </button>

        <div className="mt-5 grid items-start gap-5 xl:grid-cols-[270px_minmax(0,500px)_minmax(0,1fr)]">
          <div id="filters" className={`${filtersOpen ? "block" : "hidden"} xl:block`}>
            <FiltersPanel
                category={category} distance={distance} setDistance={setDistance}
                needs={needs}
                toggleNeed={(k) => setNeeds((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]))}
                verifiedOnly={verifiedOnly} setVerifiedOnly={setVerifiedOnly}
                within={within} setWithin={setWithin}
                resultCount={results.length} onDone={() => setFiltersOpen(false)}
            />
          </div>

          <ul className="space-y-3" aria-label="Results">
            {results.map((l) => (
                <li key={l.id}>
                  <ListingCard
                      item={l} active={activeId === l.id} saved={saved.includes(l.id)}
                      onToggleSave={() => toggleSaved(l.id)} onSelect={() => setActiveId(l.id)}
                  />
                </li>
            ))}
            {results.length === 0 && (
                <li className="rounded-xl border border-line bg-white p-6">
                  <p className="text-[18px] font-bold">No listings match these filters</p>
                  <p className="mt-2 text-[16px] leading-7 text-muted">Try a wider distance, a longer update window, or turn off “Verified only”.</p>
                  <button type="button" onClick={resetFilters} className="mt-4 rounded-lg bg-navy px-5 py-2.5 font-bold text-white hover:bg-navy-soft">
                    Widen my search
                  </button>
                </li>
            )}
          </ul>

          <div className="xl:sticky xl:top-4">
            <BoardMap items={results} activeId={activeId} onSelect={selectFromMap} onSearchArea={setArea} fit={!area} />
          </div>
        </div>
      </div>
  );
}