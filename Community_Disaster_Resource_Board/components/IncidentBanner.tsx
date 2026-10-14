import Link from "next/link";
import { incident } from "../lib/data";
import { minutes } from "../lib/tone";

export function IncidentBanner() {
  return (
    <section aria-label="Active incident" className="border-b border-line bg-[#fbe7e4]">
      <div className="mx-auto flex max-w-[1328px] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3 sm:px-8">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px]">
          <span className="rounded-full bg-[#f8d4cf] px-2.5 py-1 text-[13px] font-bold text-alert">▲ Active incident</span>
          <strong className="text-[16px]">{incident.name}</strong>
          <span className="text-navy-soft">
            {incident.areas} · Severity {incident.severity} · Updated {minutes(incident.updatedMinAgo)}
          </span>
        </p>
        <Link href="/alerts" className="font-bold text-alert underline-offset-4 hover:underline">View details</Link>
      </div>
    </section>
  );
}
