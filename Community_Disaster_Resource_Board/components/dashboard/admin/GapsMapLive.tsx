"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { GeoJSON, MapContainer, Marker, TileLayer } from "react-leaflet";
import { demoClusters } from "../../../lib/dashboard-demo";
import { floodZone } from "../../../lib/flood-zone";
import { listings } from "../../../lib/listings";

const TILE_URL = process.env.NEXT_PUBLIC_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = process.env.NEXT_PUBLIC_TILE_ATTRIBUTION ?? "&copy; OpenStreetMap contributors";

const cluster = (n: number) =>
  L.divIcon({ className: "", iconSize: [40, 40], iconAnchor: [20, 20],
    html: `<div style="width:40px;height:40px;border-radius:9999px;background:#12304d;color:#fff;border:3px solid #fff;display:grid;place-items:center;font:700 15px sans-serif;box-shadow:0 2px 6px rgba(0,0,0,.35)">${n}</div>` });
const shelter = L.divIcon({ className: "", iconSize: [28, 28], iconAnchor: [14, 14],
  html: '<div style="width:28px;height:28px;border-radius:9999px;background:#1e8a5a;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>' });

export function GapsMapLive() {
  const open = listings.filter((l) => l.category === "shelter" && l.status !== "full");
  return (
    <MapContainer center={[7.07, 79.89]} zoom={10} className="size-full" scrollWheelZoom={false}>
      <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
      <GeoJSON data={floodZone} style={{ color: "#c5291f", weight: 2, dashArray: "7 6", fillColor: "#c5291f", fillOpacity: 0.1 }} />
      {demoClusters.map((c) => <Marker key={`${c.lat}`} position={[c.lat, c.lng]} icon={cluster(c.count)} title={`${c.count} open requests`} />)}
      {open.map((l) => <Marker key={l.id} position={[l.lat, l.lng]} icon={shelter} title={l.title} />)}
    </MapContainer>
  );
}
