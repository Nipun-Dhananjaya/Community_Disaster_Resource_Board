import { stats } from "../lib/data";
import { toneBg } from "../lib/tone";
import { Icon } from "./Icon";

export function StatsStrip() {
  return (
    <section aria-label="Live totals">
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <li key={s.label} className="flex items-center gap-4 rounded-xl border border-line bg-white p-5">
            <span className={`grid size-11 shrink-0 place-items-center rounded-lg text-white ${toneBg[s.tone]}`}>
              <Icon name={s.icon} />
            </span>
            <div>
              <p className="font-display text-[30px] font-bold leading-none">{s.value}</p>
              <p className="mt-1 text-[15px] font-semibold text-muted">{s.label}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
