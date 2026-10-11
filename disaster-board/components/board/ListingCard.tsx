import Link from "next/link";
import {
  categoryMeta, PLACEHOLDER_PHONE, statusClass, statusLabel, statusMark, Listing,
} from "/lib/listings";
import { minutes, toneBg, toneBorder } from "/lib/tone";
import { Icon } from "../Icon";

export function ListingCard({
  item, active, saved, onToggleSave, onSelect,
}: {
  item: Listing;
  active: boolean;
  saved: boolean;
  onToggleSave: () => void;
  onSelect: () => void;
}) {
  const meta = categoryMeta[item.category];
  return (
    <article
      id={`listing-${item.id}`}
      onMouseEnter={onSelect}
      onFocus={onSelect}
      className={`flex items-start gap-4 rounded-xl border border-l-[5px] border-line bg-white p-5 ${toneBorder[meta.tone]} ${active ? "ring-2 ring-navy" : ""}`}
    >
      <span className={`grid size-10 shrink-0 place-items-center rounded-lg text-white ${toneBg[meta.tone]}`}>
        <Icon name={meta.icon} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="flex flex-wrap items-center gap-2 text-[18px] font-bold leading-snug">
          {item.title}
          {item.verified && <span className="rounded-md bg-navy px-2 py-0.5 text-[12px] font-bold text-white">✓ Verified</span>}
        </h3>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-[17px] font-bold">
          <span className={`rounded-full px-2.5 py-0.5 text-[13px] ${statusClass[item.status]}`}>
            {statusMark[item.status]} {statusLabel[item.status]}
          </span>
          {item.headline}
        </p>
        <p className="mt-2 text-[14px] text-muted">
          {item.distanceKm.toFixed(1)} km · {item.area} · Updated {minutes(item.updatedMin)}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/board/${item.id}`} className="rounded-lg bg-navy px-5 py-2.5 text-[15px] font-bold text-white hover:bg-navy-soft">
            View details
          </Link>
          <a href={`tel:${PLACEHOLDER_PHONE}`} aria-label={`Call ${item.title}`} className="rounded-lg border-2 border-navy px-4 py-2 text-[15px] font-bold hover:bg-navy hover:text-white">
            Call
          </a>
          <button
            type="button" onClick={onToggleSave} aria-pressed={saved} aria-label={`${saved ? "Remove" : "Save"} ${item.title}`}
            className={`rounded-lg border-2 border-navy px-4 py-2 text-[15px] font-bold ${saved ? "bg-navy text-white" : "hover:bg-navy hover:text-white"}`}
          >
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </article>
  );
}
