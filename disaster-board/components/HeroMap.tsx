"use client";

import dynamic from "next/dynamic";

const HeroMapLive = dynamic(() => import("./HeroMapLive").then((m) => m.HeroMapLive), {
  ssr: false,
  loading: () => <div className="hero-map aspect-[640/468] rounded-2xl border border-line bg-white" />,
});

export function HeroMap() {
  return <HeroMapLive />;
}