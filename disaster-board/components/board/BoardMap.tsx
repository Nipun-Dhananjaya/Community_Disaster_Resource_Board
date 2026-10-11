import { categoryMeta, Listing } from "/lib/listings";
import { toneBg } from "/lib/tone";
import { Icon } from "../Icon";

const legend = [
  { label: "Shelter", cls: "text-ok" },
  { label: "Supplies", cls: "text-warn" },
  { label: "Volunteers", cls: "text-care" },
  { label: "Transport", cls: "text-ride" },
  { label: "Requests", cls: "text-alert" },
];

/** Illustrative map. Replace the <svg> with MapLibre / Leaflet when real geodata is available. */
export function BoardMap({
  items, activeId, onSelect, onSearchArea,
}: {
  items: Listing[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onSearchArea: () => void;
}) {
  return (
    <div className="relative h-[420px] overflow-hidden rounded-2xl border border-line bg-[#e6edf2] lg:h-[min(762px,calc(100vh-2rem))]">
      <svg viewBox="0 0 518 762" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" role="img" aria-label="Map of the listings in your results and the flood-risk zone">
        <rect width="518" height="762" fill="#e6edf2" />
        <rect x="348" y="77" width="112" height="136" rx="10" fill="#d3e7d2" />
        <rect x="46" y="472" width="102" height="152" rx="10" fill="#d3e7d2" />
        <path d="M0 125 C60 120 120 150 175 215 C230 280 300 330 380 365 C440 392 490 420 518 440 L518 510 C470 475 430 460 380 440 C300 408 235 350 180 290 C130 235 70 205 0 195 Z" fill="#bad5e5" />
        <g stroke="#fff" strokeWidth="9" strokeLinecap="round" fill="none">
          <path d="M60 0 L105 762" />
          <path d="M175 0 L210 762" />
          <path d="M395 0 L350 762" />
          <path d="M495 0 L505 762" />
          <path d="M0 343 L518 235" />
          <path d="M0 605 L518 550" />
        </g>
        <ellipse cx="309" cy="420" rx="123" ry="152" fill="#c5291f" fillOpacity="0.09" stroke="#c5291f" strokeWidth="2" strokeDasharray="7 6" />
      </svg>

      <button type="button" onClick={onSearchArea} className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-lg bg-navy px-4 py-2.5 text-[15px] font-bold text-white shadow-md hover:bg-navy-soft">
        Search this area
      </button>

      {items.map((l) => {
        const meta = categoryMeta[l.category];
        const active = l.id === activeId;
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => onSelect(l.id)}
            aria-label={`${l.title}, ${l.headline}`}
            aria-pressed={active}
            style={{ left: `${l.pin.x}%`, top: `${l.pin.y}%` }}
            className={`absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-white text-white shadow-md transition-[width,height] ${toneBg[meta.tone]} ${
              active ? "z-20 size-11 ring-4 ring-navy" : "z-10 size-8"
            }`}
          >
            <Icon name={meta.icon} className={active ? "size-5" : "size-4"} />
          </button>
        );
      })}

      <div className="absolute bottom-4 right-4 z-10 max-w-[220px] rounded-xl border border-line bg-white p-4 shadow-md">
        <p className="text-[15px] font-bold">Map key</p>
        <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[13px] font-semibold">
          {legend.map((l) => (
            <span key={l.label} className={l.cls}>{l.label}</span>
          ))}
        </p>
      </div>
    </div>
  );
}
