import { categoryMeta, statusClass, statusLabel, statusMark, Category, Status } from "../../lib/listings";
import { toneBg, toneBorder } from "../../lib/tone";
import { Icon } from "../Icon";

export function PreviewCard({
  category, title, status, headline, place, verified,
}: { category: Category; title: string; status: Status; headline: string; place: string; verified: boolean }) {
  const meta = categoryMeta[category];
  const btn = "rounded-lg border-2 border-navy px-4 py-2 text-[15px] font-bold";
  return (
    <article className={`flex items-start gap-4 rounded-xl border border-l-[5px] border-line bg-white p-5 ${toneBorder[meta.tone]}`}>
      <span className={`grid size-10 shrink-0 place-items-center rounded-lg text-white ${toneBg[meta.tone]}`}>
        <Icon name={meta.icon} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="flex flex-wrap items-center gap-2 text-[18px] font-bold leading-snug">
          {title}
          {verified && <span className="rounded-md bg-navy px-2 py-0.5 text-[12px] font-bold text-white">✓ Verified</span>}
        </h3>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-[17px] font-bold">
          <span className={`rounded-full px-2.5 py-0.5 text-[13px] ${statusClass[status]}`}>{statusMark[status]} {statusLabel[status]}</span>
          {headline}
        </p>
        <p className="mt-2 text-[14px] text-muted">{place} · Updated just now</p>
        <div aria-hidden="true" className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-navy px-5 py-2.5 text-[15px] font-bold text-white">View details</span>
          <span className={btn}>Call</span>
          <span className={btn}>Save</span>
        </div>
      </div>
    </article>
  );
}
