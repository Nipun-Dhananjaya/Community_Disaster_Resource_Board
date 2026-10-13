"use client";

import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import type { Listing } from "@/lib/listings";
import { pinIcon } from "../board/BoardMapLive";

const TILE_URL = process.env.NEXT_PUBLIC_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = process.env.NEXT_PUBLIC_TILE_ATTRIBUTION ?? "&copy; OpenStreetMap contributors";

export function DetailMapLive({ listing, nearby }: { listing: Listing; nearby: Listing[] }) {
  const router = useRouter();
  return (
    <div className="board-map h-[260px] w-full">
      <MapContainer center={[listing.lat, listing.lng]} zoom={14} className="size-full" scrollWheelZoom={false}>
        <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
        {nearby.map((n) => (
          <Marker
            key={n.id}
            position={[n.lat, n.lng]}
            icon={pinIcon(n, false)}
            title={n.title}
            eventHandlers={{ click: () => router.push(`/board/${n.id}`) }}
          />
        ))}
        <Marker position={[listing.lat, listing.lng]} icon={pinIcon(listing, true)} title={listing.title} zIndexOffset={1000} />
      </MapContainer>
    </div>
  );
}
