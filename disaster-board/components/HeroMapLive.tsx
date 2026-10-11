"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { GeoJSON, MapContainer, Marker, TileLayer } from "react-leaflet";
import { featured } from "/lib/data";
import { listings } from "/lib/listings";
import { floodZone } from "/lib/flood-zone";
import { pinIcon } from "./board/BoardMapLive";
import { Icon } from "./Icon";

const TILE_URL = process.env.NEXT_PUBLIC_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = process.env.NEXT_PUBLIC_TILE_ATTRIBUTION ?? "&copy; OpenStreetMap contributors";

const bounds = L.latLngBounds(listings.map((l) => [l.lat, l.lng] as L.LatLngTuple));

export function HeroMapLive() {
    const router = useRouter();
    return (
        <div className="hero-map relative aspect-[640/468] overflow-hidden rounded-2xl border border-line">
            <MapContainer
                bounds={bounds}
                boundsOptions={{ padding: [30, 30] }}
                className="size-full"
                scrollWheelZoom={false}
            >
                <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
                <GeoJSON
                    data={floodZone}
                    style={{ color: "#c5291f", weight: 2, dashArray: "7 6", fillColor: "#c5291f", fillOpacity: 0.1 }}
                />
                {listings.map((l) => (
                    <Marker
                        key={l.id}
                        position={[l.lat, l.lng]}
                        icon={pinIcon(l, false)}
                        title={l.title}
                        eventHandlers={{ click: () => router.push("/board") }}
                    />
                ))}
            </MapContainer>

            <span className="absolute right-4 top-4 z-[1000] rounded-full bg-white px-3 py-1 text-[13px] font-bold text-alert">
        <span aria-hidden="true">- - </span>Flood-risk zone
      </span>

            <article className="absolute inset-x-[3%] bottom-[4%] z-[1000] flex items-center gap-4 rounded-xl border-l-[5px] border-l-ok bg-white p-4 shadow-lg sm:right-auto sm:w-[62%]">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-ok text-white">
          <Icon name="home" />
        </span>
                <div className="min-w-0">
                    <h2 className="truncate text-[17px] font-bold">{featured.title}</h2>
                    <p className="mt-1 flex items-center gap-2 text-[15px] font-bold">
                        <span className="rounded-full bg-ok-soft px-2.5 py-0.5 text-[13px] text-ok">● {featured.status}</span>
                        {featured.headline}
                    </p>
                    <p className="mt-1 text-[13px] text-muted">{featured.meta}</p>
                </div>
            </article>
        </div>
    );
}