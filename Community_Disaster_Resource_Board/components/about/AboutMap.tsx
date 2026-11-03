"use client";

import dynamic from "next/dynamic";

// Leaflet needs the browser, so the real map is loaded on the client only.
const Live = dynamic(() => import("./AboutMapLive").then((m) => m.AboutMapLive), {
  ssr: false,
  loading: () => <div className="size-full bg-[#e6edf2]" />,
});

export function AboutMap() {
  return (
    // "isolate" keeps the map's layers below the header menus; "board-map" lets low-bandwidth mode hide it.
    <div role="region" aria-label="Map of current shelters, supplies and volunteers" className="board-map relative isolate aspect-[560/382] w-full overflow-hidden rounded-2xl border border-line">
      <Live />
    </div>
  );
}
