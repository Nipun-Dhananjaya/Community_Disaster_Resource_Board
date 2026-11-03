"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { GeoJSON, MapContainer, Marker, TileLayer } from "react-leaflet";
import { floodZone } from "../../lib/flood-zone";
import { listings } from "../../lib/listings";
import { pinIcon } from "../board/BoardMapLive";

const TILE_URL = process.env.NEXT_PUBLIC_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = process.env.NEXT_PUBLIC_TILE_ATTRIBUTION ?? "&copy; OpenStreetMap contributors";

const bounds = L.latLngBounds(listings.map((l) => [l.lat, l.lng] as L.LatLngTuple));

export function AboutMapLive() {
  const router = useRouter();
  return (
    <MapContainer bounds={bounds} boundsOptions={{ padding: [30, 30] }} className="size-full" scrollWheelZoom={false}>
      <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
      <GeoJSON data={floodZone} style={{ color: "#c5291f", weight: 2, dashArray: "7 6", fillColor: "#c5291f", fillOpacity: 0.1 }} />
      {listings.map((l) => (
        <Marker key={l.id} position={[l.lat, l.lng]} icon={pinIcon(l, false)} title={l.title} eventHandlers={{ click: () => router.push(`/board/${l.id}`) }} />
      ))}
    </MapContainer>
  );
}
