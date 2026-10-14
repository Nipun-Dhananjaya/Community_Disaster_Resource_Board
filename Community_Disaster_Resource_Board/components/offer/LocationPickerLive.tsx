"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

const TILE_URL = process.env.NEXT_PUBLIC_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = process.env.NEXT_PUBLIC_TILE_ATTRIBUTION ?? "&copy; OpenStreetMap contributors";
const DEFAULT_CENTER: [number, number] = [7.2083, 79.8358];

const icon = L.divIcon({
  className: "",
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  html: '<div style="width:34px;height:34px;border-radius:9999px;background:#1e8a5a;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>',
});

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function FlyTo({ point }: { point: [number, number] | null }) {
  const map = useMap();
  useEffect(() => { if (point) map.flyTo(point, Math.max(map.getZoom(), 15)); }, [point, map]);
  return null;
}

export function LocationPickerLive({
  lat, lng, onPick, flyKey,
}: { lat: number | null; lng: number | null; onPick: (lat: number, lng: number) => void; flyKey: number }) {
  const point: [number, number] | null = lat !== null && lng !== null ? [lat, lng] : null;
  return (
    <MapContainer center={point ?? DEFAULT_CENTER} zoom={13} className="size-full" scrollWheelZoom={false}>
      <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
      <ClickToPlace onPick={onPick} />
      {point && (
        <Marker
          position={point}
          icon={icon}
          draggable
          eventHandlers={{ dragend: (e) => { const p = (e.target as L.Marker).getLatLng(); onPick(p.lat, p.lng); } }}
        />
      )}
      {/* flyKey changes only when "Use my location" is pressed, so tapping the map doesn't re-centre it */}
      <FlyTo key={flyKey} point={flyKey > 0 ? point : null} />
    </MapContainer>
  );
}
