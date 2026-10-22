import Link from "next/link";
import { directionsUrl, distanceKm } from "../../lib/geo";
import type { SupplyInfo } from "../../lib/details";
import { categoryMeta, listings, statusClass, statusLabel, statusMark, type Listing } from "../../lib/listings";
import { reservedFor } from "../../lib/server/data";
import { minutes, toneBg, toneBorder } from "../../lib/tone";
import { Icon } from "../Icon";
import { DetailMap } from "./DetailMap";
import { ReserveForm } from "./ReserveForm";
import { ShareSaveButtons } from "./DetailActions";

export function SupplyView({ l, info }: { l: Listing; info: SupplyInfo }) {
  const left = Math.max(0, info.left - reservedFor(l.id));
  const pct = Math.round(((info.total - left) / info.total) * 100);
  const dir = directionsUrl(l.lat, l.lng);

  const nearby = listings
    .filter((x) => x.id !== l.id && x.category !== l.category && x.category !== "request")
    .map((x) => ({ item: x, km: distanceKm(l, x) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 3);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="space-y-5">
        <section className="rounded-xl border border-t-4 border-line border-t-warn bg-white p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[13px] font-bold ${statusClass[l.status]}`}>{statusMark[l.status]} {statusLabel[l.status]}</span>
              <span className="rounded-full bg-warn-soft px-2.5 py-1 text-[13px] font-bold text-[#8a4a0a]">{info.categoryLabel}</span>
            </p>
            <p className="text-[14px] text-muted">Updated {minutes(l.updatedMin)}</p>
          </div>
          <h1 className="mt-4 font-display text-[34px] font-bold leading-tight sm:text-[42px]">{l.title}</h1>
          <p className="mt-2 text-[16px] text-muted">{info.description}</p>

          <div className="mt-7 flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-display text-[34px] font-bold text-warn sm:text-[40px]">{left > 0 ? `${left} left` : "None left"}</p>
            <p className="text-[15px] text-muted">of {info.total} · limit {info.limit} {info.unit} per household</p>
          </div>
          <div role="img" aria-label={`${left} of ${info.total} ${info.unit} left`} className="mt-3 h-3.5 w-full overflow-hidden rounded-full bg-[#fdebd9]">
            <div className="h-full bg-navy" style={{ width: `${pct}%` }} />
          </div>

          <dl className="mt-6 grid gap-3 sm:grid-cols-3">
            {[["Condition", info.condition], ["How to get it", info.howToGet], ["Open hours", info.hours]].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-line p-4">
                <dt className="text-[14px] font-semibold text-muted">{k}</dt>
                <dd className="mt-1 text-[17px] font-bold">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-label="Location" className="overflow-hidden rounded-xl border border-line bg-white">
          <DetailMap listing={l} nearby={nearby.map((n) => n.item)} />
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:px-6">
            <div>
              <p className="text-[17px] font-bold">{info.address}</p>
              <p className="mt-1 text-[14px] text-muted">{l.distanceKm.toFixed(1)} km from you · {info.landmark}</p>
            </div>
            <a href={dir} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-navy px-6 py-3.5 text-[16px] font-bold text-white hover:bg-navy-soft">Get directions</a>
          </div>
        </section>

        <section aria-labelledby="collect-h" className="rounded-xl border border-line bg-white p-6 sm:p-7">
          <h2 id="collect-h" className="font-display text-[26px] font-bold">Who can collect</h2>
          <p className="mt-3 text-[16px] leading-7 text-muted">{info.collect}</p>
        </section>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-4">
        <ReserveForm listingId={l.id} unit={info.unit} limit={info.limit} left={left} delivery={info.delivery} holdHours={info.holdHours} />

        <section aria-label="Provider" className="rounded-xl border border-line bg-white p-6">
          <p className="text-[14px] font-bold text-muted">Provider</p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-[19px] font-bold">
            {info.provider}
            {info.providerVerified && <span className="rounded-md bg-navy px-2 py-0.5 text-[12px] font-bold text-white">✓ Verified</span>}
          </p>
          <div className="mt-5 space-y-3">
            <a href={`tel:${info.phone}`} className="block rounded-lg bg-ok px-4 py-3.5 text-center text-[17px] font-bold text-white hover:brightness-110">Call provider</a>
            <ShareSaveButtons id={l.id} title={l.title} />
          </div>
          <p className="mt-5 text-[14px]">
            <Link href={`/contact?report=${l.id}`} className="text-muted underline underline-offset-2 hover:text-navy">Report incorrect info</Link>
          </p>
        </section>

        {nearby.length > 0 && (
          <section aria-labelledby="nearby-h" className="rounded-xl border border-line bg-white p-6">
            <h2 id="nearby-h" className="font-display text-[24px] font-bold">Also nearby</h2>
            <ul className="mt-4 space-y-3">
              {nearby.map(({ item, km }) => {
                const m = categoryMeta[item.category];
                return (
                  <li key={item.id}>
                    <Link href={`/board/${item.id}`} className={`flex items-start gap-4 rounded-xl border border-l-[5px] border-line bg-white p-4 hover:bg-canvas ${toneBorder[m.tone]}`}>
                      <span className={`grid size-10 shrink-0 place-items-center rounded-lg text-white ${toneBg[m.tone]}`}><Icon name={m.icon} /></span>
                      <span className="min-w-0">
                        <span className="block text-[17px] font-bold leading-snug">{item.title}</span>
                        {item.verified && <span className="mt-1.5 inline-block rounded-md bg-navy px-2 py-0.5 text-[12px] font-bold text-white">✓ Verified</span>}
                        <span className="mt-1.5 flex flex-wrap items-center gap-2 text-[16px] font-bold">
                          <span className={`rounded-full px-2.5 py-0.5 text-[13px] ${statusClass[item.status]}`}>{statusMark[item.status]} {statusLabel[item.status]}</span>
                          {item.headline}
                        </span>
                        <span className="mt-1.5 block text-[14px] text-muted">{km.toFixed(1)} km</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </aside>
    </div>
  );
}
