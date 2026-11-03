import type { Metadata } from "next";
import Link from "next/link";
import { EmergencyBar } from "../../components/EmergencyBar";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { AboutMap } from "../../components/about/AboutMap";

export const metadata: Metadata = { title: "About · Community Disaster Resource Board", description: "A free noticeboard that connects people who need help with people who can give it." };

// Placeholder content from the design. Replace the figures, team and partner names with your real ones before launch.
const pillars = [
  { top: "border-t-alert", kicker: "The problem", title: "Help is scattered", text: "In a flood or storm, offers and requests spread across phone calls and chat groups. People travel to shelters that are already full." },
  { top: "border-t-navy", kicker: "What we do", title: "One checked board", text: "Shelters, supplies, rides, volunteers and requests in one list and map, each showing when it was last updated." },
  { top: "border-t-ok", kicker: "Who it is for", title: "Everyone involved", text: "Families who need help, neighbors who can give it, shelter managers, volunteers and coordinators." },
];
const steps = [
  { title: "Posted", text: "Anyone with an account posts a resource. Requests for help need no account." },
  { title: "Checked", text: "Moderators review new listings and organization documents, usually within 30 minutes." },
  { title: "Badged", text: "Checked organizations get a Verified badge. Unverified listings are labelled." },
  { title: "Kept fresh", text: "Listings expire unless the owner reconfirms, and anyone can report wrong information." },
];
const stats = [["2,140", "People sheltered"], ["860", "Requests fulfilled"], ["310", "Active volunteers"], ["18 min", "Median response"]];
const team = [
  { initials: "KW", name: "Kasun W.", role: "Project lead", bg: "bg-navy" }, { initials: "DR", name: "Dilini R.", role: "Lead moderator", bg: "bg-ok" },
  { initials: "AM", name: "Ayesha M.", role: "Volunteer coordinator", bg: "bg-care" }, { initials: "SP", name: "Saman P.", role: "Field and transport liaison", bg: "bg-ride" },
];
const partners = ["District Disaster Management Unit", "Local Red Cross branch", "University ICT Society", "Youth Societies Network", "Divisional Secretariat"];
const promises = [
  "Names and phone numbers never appear on the public board",
  "We do not sell data or show advertising",
  "Every admin action is recorded in an audit log",
  "Data is deleted or anonymized after an incident closes",
  "Aggregate numbers are shared with partners, never personal details",
];

export default function AboutPage() {
  return (
    <>
      <EmergencyBar />
      <Header activeHref="/" />
      <main id="main">
        <div className="mx-auto w-full max-w-[1328px] px-4 pb-16 pt-10 sm:px-8">
          <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_560px]">
            <div>
              <p className="inline-block rounded-full bg-ok-soft px-3 py-1 text-[13px] font-bold text-ok">About the board</p>
              <h1 className="mt-4 font-display text-[44px] font-bold leading-[1.1] sm:text-[56px]">Built so help can find people faster.</h1>
              <p className="mt-5 max-w-[600px] text-[19px] leading-8 text-muted">
                The Community Disaster Resource Board is a free noticeboard for emergencies. It connects people who need shelter, food, transport or rescue with neighbors, organizations and volunteers who can provide it.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/request-help" className="rounded-lg bg-alert px-7 py-4 text-[17px] font-bold text-white hover:brightness-110">I need help</Link>
                <Link href="/offer-help" className="rounded-lg border-2 border-navy bg-white px-7 py-3.5 text-[17px] font-bold hover:bg-navy hover:text-white">I can help</Link>
              </div>
            </div>
            <AboutMap />
          </section>

          <ul className="mt-12 grid gap-5 lg:grid-cols-3">
            {pillars.map((p) => (
              <li key={p.title} className={`rounded-xl border border-t-[6px] border-line bg-white p-6 ${p.top}`}>
                <p className="text-[14px] font-semibold text-muted">{p.kicker}</p>
                <h2 className="mt-1 font-display text-[28px] font-bold">{p.title}</h2>
                <p className="mt-2 text-[16px] leading-7 text-muted">{p.text}</p>
              </li>
            ))}
          </ul>

          <section aria-labelledby="trust-h" className="mt-14">
            <h2 id="trust-h" className="font-display text-[36px] font-bold">How we keep information trustworthy</h2>
            <p className="mt-2 text-[17px] text-muted">Wrong information costs time when time matters, so every listing goes through four steps.</p>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title} className="rounded-xl border border-line bg-white p-5">
                  <span className="grid size-[46px] place-items-center rounded-full bg-navy font-display text-[20px] font-bold text-white">{i + 1}</span>
                  <h3 className="mt-4 text-[19px] font-bold">{s.title}</h3>
                  <p className="mt-2 text-[16px] leading-7 text-muted">{s.text}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section aria-label="Impact so far" className="bg-navy py-12 text-white">
          <dl className="mx-auto grid max-w-[1328px] grid-cols-2 gap-8 px-4 text-center sm:px-8 lg:grid-cols-4">
            {stats.map(([n, l]) => (
              <div key={l}>
                <dd className="font-display text-[52px] font-bold leading-none">{n}</dd>
                <dt className="mt-2 text-[17px] font-semibold">{l}</dt>
              </div>
            ))}
          </dl>
        </section>

        <div className="mx-auto w-full max-w-[1328px] px-4 pb-20 pt-14 sm:px-8">
          <section aria-labelledby="people-h">
            <h2 id="people-h" className="font-display text-[36px] font-bold">The people behind it</h2>
            <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {team.map((t) => (
                <li key={t.name} className="rounded-xl border border-line bg-white p-5 text-center">
                  <span aria-hidden="true" className={`mx-auto grid size-[72px] place-items-center rounded-full font-display text-[26px] font-bold text-white ${t.bg}`}>{t.initials}</span>
                  <p className="mt-3 text-[17px] font-bold">{t.name}</p>
                  <p className="text-[14px] text-muted">{t.role}</p>
                </li>
              ))}
            </ul>
            <p className="mb-3 mt-8 text-[14px] font-semibold text-muted">Partner organizations</p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {partners.map((p) => <li key={p} className="grid min-h-[88px] place-items-center rounded-xl border border-line bg-white p-4 text-center text-[16px] font-bold">{p}</li>)}
            </ul>
          </section>

          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            <section aria-labelledby="promise-h" className="rounded-xl border border-line bg-white p-6 sm:p-7">
              <h2 id="promise-h" className="font-display text-[32px] font-bold">Our data promises</h2>
              <ul className="mt-3 space-y-2 text-[16px]">
                {promises.map((p) => <li key={p}><span aria-hidden="true">✓ </span>{p}</li>)}
              </ul>
              <p className="mt-4"><Link href="/privacy" className="text-[16px] font-bold underline underline-offset-2">Read the Privacy Policy</Link></p>
            </section>
            <section aria-labelledby="join-h" className="rounded-xl bg-alert p-6 text-white sm:p-7">
              <h2 id="join-h" className="font-display text-[32px] font-bold">Join in</h2>
              <p className="mt-2 max-w-[560px] text-[18px] leading-8">Post what you can offer, volunteer your skills, or bring your organization on as a verified partner.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/offer-help" className="rounded-lg bg-white px-5 py-3.5 text-[16px] font-bold text-[#9a1c14] hover:bg-[#f4e3e1]">Offer a resource</Link>
                <Link href="/contact?topic=partner" className="rounded-lg border-2 border-white px-5 py-3 text-[16px] font-bold hover:bg-white hover:text-[#9a1c14]">Become a partner</Link>
                <Link href="/contact" className="rounded-lg border-2 border-white px-5 py-3 text-[16px] font-bold hover:bg-white hover:text-[#9a1c14]">Contact us</Link>
              </div>
              <p className="mt-5 text-[16px] font-bold">In danger? Call <a href="tel:119" className="underline">119</a> or the disaster hotline <a href="tel:117" className="underline">117</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
