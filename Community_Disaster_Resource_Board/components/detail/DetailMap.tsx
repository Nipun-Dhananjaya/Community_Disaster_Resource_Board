"use client";

import dynamic from "next/dynamic";
import type { Listing } from "../../lib/listings";

// Leaflet needs the browser, so the map is loaded on the client only.
const DetailMapLive = dynamic(() => import("./DetailMapLive").then((m) => m.DetailMapLive), {
  ssr: false,
  loading: () => <div className="h-[260px] w-full bg-[#e6edf2]" />,
});

export function DetailMap({ listing, nearby }: { listing: Listing; nearby: Listing[] }) {
  return <DetailMapLive listing={listing} nearby={nearby} />;
}
