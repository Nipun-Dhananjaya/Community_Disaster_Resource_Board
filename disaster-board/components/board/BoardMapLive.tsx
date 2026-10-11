"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { GeoJSON, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { categoryMeta, Listing } from "/lib/listings";
import { floodZone } from "/lib/flood-zone";

export type Area = { south: number; west: number; north: number; east: number };

const toneHex = { ok: "#1e8a5a", warn: "#d8731f", alert: "#c5291f", care: "#6f4db8", ride: "#15878c" };

const TILE_URL = process.env.NEXT_PUBLIC_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = process.env.NEXT_PUBLIC_TILE_ATTRIBUTION ?? "&copy; OpenStreetMap contributors";

export function pinIcon(l: Listing, active: boolean) {
    const size = active ? 40 : 30;
    const color = toneHex[categoryMeta[l.category].tone];
    return L.divIcon({
        className: "",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);${active ? "outline:4px solid #12304d;" : ""}"></div>`,
    });
}

/** Zooms the map to show all current results (skipped while a map area is applied). */
function FitToResults({ items, enabled }: { items: Listing[]; enabled: boolean }) {
    const map = useMap();
    useEffect(() => {
        if (!enabled || items.length === 0) return;
        const points = items.map((l) => [l.lat, l.lng] as L.LatLngTuple);
        map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 });
    }, [items, enabled, map]);
    return null;
}

/** Sends the currently visible map area to the page so results can be filtered by it. */
function SearchAreaButton({ onSearchArea }: { onSearchArea: (a: Area) => void }) {
    const map = useMap();
    return (
        <button
            type="button"
            onClick={() => {
                const b = map.getBounds();
                onSearchArea({ south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() });
            }}
            className="absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-lg bg-navy px-4 py-2.5 text-[15px] font-bold text-white shadow-md hover:bg-navy-soft"
        >
            Search this area
        </button>
    );
}

export function BoardMapLive({
                                 items, activeId, onSelect, onSearchArea, fit,
                             }: {
    items: Listing[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onSearchArea: (area: Area) => void;
    fit: boolean;
}) {
    return (
        <div className="board-map relative h-[420px] overflow-hidden rounded-2xl border border-line lg:h-[min(762px,calc(100vh-2rem))]">
            <MapContainer center={[7.1, 79.88]} zoom={11} className="size-full" scrollWheelZoom>
                <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
                {/* Flood-risk zone: replace lib/flood-zone.ts with the official GeoJSON from your authority */}
                <GeoJSON
                    data={floodZone}
                    style={{ color: "#c5291f", weight: 2, dashArray: "7 6", fillColor: "#c5291f", fillOpacity: 0.1 }}
                />
                {items.map((l) => (
                    <Marker
                        key={l.id}
                        position={[l.lat, l.lng]}
                        icon={pinIcon(l, l.id === activeId)}
                        zIndexOffset={l.id === activeId ? 1000 : 0}
                        eventHandlers={{ click: () => onSelect(l.id) }}
                        title={l.title}
                    />
                ))}
                <FitToResults items={items} enabled={fit} />
                <SearchAreaButton onSearchArea={onSearchArea} />
            </MapContainer>
        </div>
    );
}