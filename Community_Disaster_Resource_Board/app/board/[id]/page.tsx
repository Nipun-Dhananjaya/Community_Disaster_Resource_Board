import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmergencyBar } from "../../../components/EmergencyBar";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import { Icon } from "../../../components/Icon";
import { DetailMap } from "../../../components/detail/DetailMap";
import { ShareSaveButtons } from "../../../components/detail/DetailActions";
import { getDetail } from "../../../lib/details";
import { directionsUrl, distanceKm } from "../../../lib/geo";
import { categoryMeta, listings, statusClass, statusLabel, statusMark, Status } from "../../../lib/listings";
import { minutes, toneBg, toneBorder } from "../../../lib/tone";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return listings.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const l = listings.find((x) => x.id === id);
  return { title: l ? `${l.title} · Community Disaster Resource Board` : "Not found" };
}

const topBorder = { ok: "border-t-ok", warn: "border-t-warn", alert: "border-t-alert", care: "border-t-care", ride: "border-t-ride" };
const headlineColor: Record<Status, string> = {
  available: "text-ok", limited: "text-[#a85a0f]", full: "text-[#3f5163]", critical: "text-alert", open: "text-[#a85a0f]",
};

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const l = listings.find((x) => x.id === id);
  if (!l) notFound();

  const d = getDetail(l);
  const meta = categoryMeta[l.category];
  const isShelter = l.category === "shelter";

  // Shelters read "Open" unless full; other categories use their own status wording.
  const badgeStatus: Status = isShelter ? (l.status === "full" ? "full" : "available") : l.status;
  const badgeText = isShelter ? (l.status === "full" ? "Full" : "Open") : statusLabel[l.status];

  const nearby = listings
    .filter((x) => x.id !== l.id && x.category !== l.category && x.category !== "request")
    .map((x) => ({ item: x, km: distanceKm(l, x) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 3);

  const cap = d.capacity;
  const free = cap ? cap.total - cap.taken : 0;
  const pct = cap ? Math.round((cap.taken / cap.total) * 100) : 0;
  const dir = directionsUrl(l.lat, l.lng);

  return (
    <>
      <EmergencyBar />
      <Header />
      <main id="main" className="mx-auto w-full max-w-[1328px] px-4 pb-16 pt-8 sm:px-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-[14px] text-muted">
          <ol className="flex flex-wrap items-center gap-x-2">
            <li><Link href="/board" className="hover:underline">Resource Board</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href={`/board?category=${l.category}`} className="hover:underline">{meta.chip}</Link></li>
            <li aria-hidden="true">›</li>
            <li aria-current="page">{l.title}</li>
          </ol>
        </nav>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            {/* Summary */}
            <section className={`rounded-xl border border-t-4 border-line bg-white p-6 sm:p-7 ${topBorder[meta.tone]}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[13px] font-bold ${statusClass[badgeStatus]}`}>
                    {statusMark[badgeStatus]} {badgeText}
                  </span>
                  {l.verified && <span className="rounded-md bg-navy px-2.5 py-1 text-[13px] font-bold text-white">✓ Verified</span>}
                </p>
                <p className="text-[14px] text-muted">Updated {minutes(l.updatedMin)}</p>
              </div>

              <h1 className="mt-4 font-display text-[34px] font-bold leading-tight sm:text-[42px]">{l.title}</h1>
              <p className="mt-2 text-[16px] text-muted">{d.description}</p>

              {cap ? (
                <div className="mt-7">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className={`font-display text-[34px] font-bold sm:text-[40px] ${headlineColor[l.status]}`}>
                      {free > 0 ? `${free} beds free` : "No beds free"}
                    </p>
                    <p className="text-[15px] text-muted">of {cap.total} · {cap.checkIn}</p>
                  </div>
                  <div
                    role="img"
                    aria-label={`${cap.taken} of ${cap.total} beds taken`}
                    className="mt-3 h-3.5 w-full overflow-hidden rounded-full bg-[#dff1e6]"
                  >
                    <div className="h-full bg-navy" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-2 text-[14px] text-muted">{cap.taken} beds taken</p>
                </div>
              ) : (
                <p className={`mt-6 font-display text-[34px] font-bold ${headlineColor[l.status]}`}>{l.headline}</p>
              )}

              {d.amenities.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2.5" aria-label="Facilities">
                  {d.amenities.map((a) => (
                    <li key={a} className="rounded-full border border-line px-4 py-2 text-[15px] font-semibold">✓ {a}</li>
                  ))}
                </ul>
              )}
            </section>

            {/* Map and address */}
            <section aria-label="Location" className="overflow-hidden rounded-xl border border-line bg-white">
              <DetailMap listing={l} nearby={nearby.map((n) => n.item)} />
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:px-6">
                <div>
                  <p className="text-[17px] font-bold">{d.address}</p>
                  {d.landmark && <p className="mt-1 text-[14px] text-muted">{d.landmark}</p>}
                </div>
                <a href={dir} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-navy px-6 py-3.5 text-[16px] font-bold text-white hover:bg-navy-soft">
                  Get directions
                </a>
              </div>
            </section>

            {d.rules.length > 0 && (
              <section aria-labelledby="rules-h" className="rounded-xl border border-line bg-white p-6 sm:p-7">
                <h2 id="rules-h" className="font-display text-[26px] font-bold">
                  {isShelter ? "Rules and what to bring" : "Good to know"}
                </h2>
                <ul className="mt-4 list-disc space-y-3 pl-6 text-[16px]">
                  {d.rules.map((r) => <li key={r}>{r}</li>)}
                </ul>
              </section>
            )}

            <section aria-labelledby="log-h" className="rounded-xl border border-line bg-white p-6 sm:p-7">
              <h2 id="log-h" className="font-display text-[26px] font-bold">Update log</h2>
              <ol className="mt-4 space-y-4">
                {d.log.map((e) => (
                  <li key={e.text} className="grid grid-cols-[auto_110px_1fr] items-baseline gap-x-4 text-[16px]">
                    <span aria-hidden="true" className={`size-3 rounded-full ${e.tone === "ok" ? "bg-ok" : "bg-navy"}`} />
                    <span className="font-bold">{minutes(e.minAgo)}</span>
                    <span>{e.text}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-4">
            <section aria-label="Contact" className="rounded-xl border border-line bg-white p-6">
              <p className="text-[14px] font-bold text-muted">{d.contact.label}</p>
              <p className="mt-1 text-[19px] font-bold">{d.contact.name}</p>
              <div className="mt-5 space-y-3">
                <a href={`tel:${d.contact.phone}`} className="block rounded-lg bg-ok px-4 py-4 text-center text-[18px] font-bold text-white hover:brightness-110">
                  Call {d.contact.display}
                </a>
                <a href={dir} target="_blank" rel="noopener noreferrer" className="block rounded-lg border-2 border-navy px-4 py-3.5 text-center text-[16px] font-bold hover:bg-navy hover:text-white">
                  Get directions
                </a>
                <ShareSaveButtons id={l.id} title={l.title} />
              </div>
              <p className="mt-5 text-[14px]">
                <Link href={`/contact?report=${l.id}`} className="text-muted underline underline-offset-2 hover:text-navy">
                  Report incorrect info
                </Link>
              </p>
            </section>

            {nearby.length > 0 && (
              <section aria-labelledby="nearby-h" className="rounded-xl border border-line bg-white p-6">
                <h2 id="nearby-h" className="font-display text-[24px] font-bold">Nearby resources</h2>
                <ul className="mt-4 space-y-3">
                  {nearby.map(({ item, km }) => {
                    const m = categoryMeta[item.category];
                    return (
                      <li key={item.id}>
                        <Link
                          href={`/board/${item.id}`}
                          className={`flex items-start gap-4 rounded-xl border border-l-[5px] border-line bg-white p-4 hover:bg-canvas ${toneBorder[m.tone]}`}
                        >
                          <span className={`grid size-10 shrink-0 place-items-center rounded-lg text-white ${toneBg[m.tone]}`}>
                            <Icon name={m.icon} />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[17px] font-bold leading-snug">{item.title}</span>
                            <span className="mt-1.5 flex flex-wrap items-center gap-2 text-[16px] font-bold">
                              <span className={`rounded-full px-2.5 py-0.5 text-[13px] ${statusClass[item.status]}`}>
                                {statusMark[item.status]} {statusLabel[item.status]}
                              </span>
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
      </main>
      <Footer />
    </>
  );
}
