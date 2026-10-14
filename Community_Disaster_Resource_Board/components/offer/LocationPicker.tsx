"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const Live = dynamic(() => import("./LocationPickerLive").then((m) => m.LocationPickerLive), {
  ssr: false,
  loading: () => <div className="size-full bg-[#e6edf2]" />,
});

export function LocationPicker({
  label, lat, lng, error, onChange,
}: {
  label: string;
  lat: string;
  lng: string;
  error?: string;
  onChange: (lat: string, lng: string) => void;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [flyKey, setFlyKey] = useState(0);
  const la = lat === "" ? null : Number(lat);
  const ln = lng === "" ? null : Number(lng);

  function locate() {
    if (!("geolocation" in navigator)) return setStatus("Your browser can’t share location. Tap the map instead.");
    setStatus("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude.toFixed(5), pos.coords.longitude.toFixed(5));
        setFlyKey((k) => k + 1);
        setStatus("Pin placed at your location. Drag it to adjust.");
      },
      () => setStatus("Couldn’t get your location. Tap the map instead."),
      { timeout: 8000 },
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[15px] font-bold">{label}</p>
        <button type="button" onClick={locate} className="rounded-lg border-2 border-navy px-3 py-1.5 text-[14px] font-bold hover:bg-navy hover:text-white">
          Use my location
        </button>
      </div>
      <div
        className={`mt-2 h-[200px] overflow-hidden rounded-xl border ${error ? "border-alert ring-1 ring-alert" : "border-line"}`}
        role="group"
        aria-label="Map. Tap to place the pin."
      >
        <Live lat={la} lng={ln} flyKey={flyKey} onPick={(a, b) => onChange(a.toFixed(5), b.toFixed(5))} />
      </div>
      <p role="status" className="mt-1.5 text-[14px] text-muted">
        {status ?? (la !== null ? "Pin placed. Drag it or tap elsewhere to move it." : "No pin yet.")}
      </p>
      {error && <p role="alert" className="mt-1 text-[14px] font-bold text-alert">{error}</p>}
    </div>
  );
}
