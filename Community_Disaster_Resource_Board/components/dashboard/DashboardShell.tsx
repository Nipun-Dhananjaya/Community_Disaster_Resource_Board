import Link from "next/link";
import type { NavEntry } from "../../lib/roles";
import { Icon } from "../Icon";
import { SideLogout, SideNavLink } from "./SideNavLink";

export function DashboardShell({ brand, nav, children }: { brand: [string, string]; nav: NavEntry[]; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="bg-navy text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-alert"><Icon name="home" className="size-5" /></span>
          <span className="font-display text-[18px] font-bold leading-tight">{brand[0]}<br />{brand[1]}</span>
        </div>
        <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {nav.map((n) => <SideNavLink key={n.href} href={n.href} label={n.label} exact={n.exact} />)}
        </nav>
        <div className="flex gap-1 px-3 pb-4 lg:flex-col lg:pb-5">
          <Link href="/" className="rounded-lg px-5 py-3 text-[15px] font-semibold text-[#c9d6e3] hover:bg-[#1d3b5a] hover:text-white">Public site</Link>
          <SideLogout />
        </div>
      </aside>
      <main id="main" className="px-5 py-8 lg:px-10">
        <div className="mx-auto max-w-[1160px]">{children}</div>
      </main>
    </div>
  );
}
