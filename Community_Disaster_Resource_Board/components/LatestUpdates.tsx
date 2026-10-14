import Link from "next/link";
import { updates } from "../lib/data";
import { toneBadge, toneBg, toneBorder } from "../lib/tone";
import { Icon } from "./Icon";

export function LatestUpdates() {
  return (
    <section aria-labelledby="latest" className="mt-14">
      <div className="mb-5 flex items-baseline justify-between">
        <h2 id="latest" className="font-display text-[30px] font-bold">Latest updates</h2>
        <Link href="/board" className="font-bold underline-offset-4 hover:underline">Open the full board</Link>
      </div>
      <ul className="grid gap-4 lg:grid-cols-3">
        {updates.map((u) => (
          <li key={u.id}>
            <article className={`flex h-full items-start gap-4 rounded-xl border border-l-[5px] border-line bg-white p-5 ${toneBorder[u.tone]}`}>
              <span className={`grid size-10 shrink-0 place-items-center rounded-lg text-white ${toneBg[u.tone]}`}>
                <Icon name={u.icon} />
              </span>
              <div className="min-w-0">
                <h3 className="flex flex-wrap items-center gap-2 text-[17px] font-bold">
                  {u.title}
                  {u.verified && (
                    <span className="rounded-md bg-navy px-2 py-0.5 text-[12px] font-bold text-white">✓ Verified</span>
                  )}
                </h3>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-[16px] font-bold">
                  <span className={`rounded-full px-2.5 py-0.5 text-[13px] ${toneBadge[u.badge.tone]}`}>
                    {u.badge.dot ? "● " : "▲ "}
                    {u.badge.label}
                  </span>
                  {u.headline}
                </p>
                <p className="mt-2 text-[14px] text-muted">{u.meta}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
