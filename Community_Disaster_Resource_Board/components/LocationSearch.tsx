"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LocationSearch() {
  const router = useRouter();
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function useMyLocation() {
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("Your browser can’t share location. Type your town instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        router.push(`/board?lat=${latitude.toFixed(4)}&lng=${longitude.toFixed(4)}`);
      },
      () => {
        setLocating(false);
        setError("Couldn’t get your location. Type your town or postcode instead.");
      },
      { timeout: 8000 },
    );
  }

  return (
    <div>
      {/* Plain GET form: works without JavaScript */}
      <form action="/board" method="get" role="search" className="flex items-center gap-2 rounded-xl border border-line bg-white p-1.5 pl-4 max-w-[560px]">
        <label htmlFor="near" className="sr-only">Town or postcode</label>
        <input
          id="near"
          name="near"
          type="text"
          autoComplete="postal-code"
          placeholder="Enter your town or postcode"
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[16px] placeholder:text-muted focus:outline-none"
        />
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="shrink-0 rounded-lg border-2 border-navy px-4 py-2 text-[15px] font-bold hover:bg-navy hover:text-white disabled:opacity-60"
        >
          {locating ? "Locating…" : "Use my location"}
        </button>
        <button type="submit" className="sr-only">Search</button>
      </form>
      <p role="status" className="mt-3 text-[14px] text-muted">
        {error ?? "Every listing shows when it was last updated."}
      </p>
    </div>
  );
}
