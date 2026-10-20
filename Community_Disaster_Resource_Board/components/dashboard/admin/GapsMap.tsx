"use client";

import dynamic from "next/dynamic";

const Live = dynamic(() => import("./GapsMapLive").then((m) => m.GapsMapLive), {
  ssr: false,
  loading: () => <div className="size-full bg-[#e6edf2]" />,
});

export function GapsMap({ tall = false }: { tall?: boolean }) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="p-6 pb-4">
        <h2 className="font-display text-[22px] font-bold">Gaps: requests vs resources</h2>
        <p className="mt-1 text-[14px] text-muted">Dark circles show open requests; green pins show available shelters.</p>
      </div>
      <div className={tall ? "h-[560px]" : "h-[300px]"}><Live /></div>
    </section>
  );
}
