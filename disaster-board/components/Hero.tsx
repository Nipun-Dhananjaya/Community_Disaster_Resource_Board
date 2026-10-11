import Link from "next/link";
import { LocationSearch } from "./LocationSearch";
import { HeroMap } from "./HeroMap";

export function Hero() {
  return (
    <section className="hero-grid grid items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_640px] lg:gap-16 lg:py-14">
      <div>
        <h1 className="font-display text-[44px] font-bold leading-[1.08] sm:text-[56px] lg:text-[64px]">
          Find help.<br />Offer help.<br />Stay connected.
        </h1>
        <p className="mt-6 max-w-[480px] text-[19px] leading-8 text-muted">
          Shelters, supplies, volunteers and rides near you, kept current by the people running them.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/request-help" className="rounded-lg bg-alert px-7 py-4 text-[18px] font-bold text-white hover:brightness-110">
            I need help
          </Link>
          <Link href="/offer-help" className="rounded-lg bg-navy px-7 py-4 text-[18px] font-bold text-white hover:bg-navy-soft">
            I can help
          </Link>
        </div>
        <div className="mt-6">
          <LocationSearch />
        </div>
      </div>
      <HeroMap />
    </section>
  );
}
