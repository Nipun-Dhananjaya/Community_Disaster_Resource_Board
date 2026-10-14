import type { Metadata } from "next";
import Link from "next/link";
import { EmergencyBar } from "../../components/EmergencyBar";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Icon } from "../../components/Icon";
import { LoginPrompt } from "../../components/offer/LoginPrompt";
import type { IconName } from "../../lib/data";

export const metadata: Metadata = {
  title: "Offer help · Community Disaster Resource Board",
  description: "Offer a shelter, supplies, transport or your time.",
};

const options: { href: string; title: string; text: string; icon: IconName; top: string; bg: string }[] = [
  { href: "/offer-help/shelter", title: "Offer a shelter", text: "Open a hall, school or home and keep your bed count current.", icon: "home", top: "border-t-ok", bg: "bg-ok" },
  { href: "/offer-help/supplies", title: "Offer supplies", text: "List water, food, medicine or fuel with pickup or delivery.", icon: "box", top: "border-t-warn", bg: "bg-warn" },
  { href: "/offer-help/transport", title: "Offer transport", text: "Share seats or cargo space on a route and time.", icon: "arrow", top: "border-t-ride", bg: "bg-ride" },
  { href: "/offer-help/volunteer", title: "Volunteer", text: "Register your skills and when you can help.", icon: "heart", top: "border-t-care", bg: "bg-care" },
];

export default function OfferHubPage() {
  return (
    <>
      <EmergencyBar />
      <Header />
      <main id="main" className="mx-auto w-full max-w-[1328px] px-4 pb-20 pt-12 sm:px-8">
        <h1 className="font-display text-[44px] font-bold leading-tight sm:text-[52px]">What can you offer?</h1>
        <p className="mt-3 max-w-[640px] text-[19px] leading-8 text-muted">
          Pick one. Your listing goes live after a quick check, and you can update it in one tap.
        </p>

        <ul className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {options.map((o) => (
            <li key={o.href} className={`flex flex-col rounded-2xl border border-t-[6px] border-line bg-white p-7 ${o.top}`}>
              <span className={`grid size-14 place-items-center rounded-xl text-white ${o.bg}`}><Icon name={o.icon} className="size-7" /></span>
              <h2 className="mt-5 font-display text-[26px] font-bold">{o.title}</h2>
              <p className="mt-2 flex-1 text-[16px] leading-7 text-muted">{o.text}</p>
              <Link href={o.href} aria-label={`Start: ${o.title}`} className={`mt-6 self-start rounded-lg px-6 py-3 text-[16px] font-bold text-white hover:brightness-110 ${o.bg}`}>
                Start
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8"><LoginPrompt /></div>
      </main>
      <Footer />
    </>
  );
}
