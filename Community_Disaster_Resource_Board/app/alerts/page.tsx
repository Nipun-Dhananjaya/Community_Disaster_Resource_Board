import type { Metadata } from "next";
import Link from "next/link";
import { EmergencyBar } from "../../components/EmergencyBar";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { AlertFeed } from "../../components/alerts/AlertFeed";
import { SubscribeForm } from "../../components/alerts/SubscribeForm";
import { incident } from "../../lib/data";
import { listAlerts } from "../../lib/server/data";

export const metadata: Metadata = {
  title: "Alerts · Community Disaster Resource Board",
  description: "Official warnings, road closures, weather and platform news for your area.",
};
export const dynamic = "force-dynamic"; // new alerts from the admin console show up straight away

export default function AlertsPage() {
  const alerts = listAlerts().map((a) => ({
    id: a.id, title: a.title, body: a.body, source: a.source, near: a.near, kind: a.kind, severity: a.severity,
    minAgo: Math.max(1, Math.round((Date.now() - new Date(a.publishedAt).getTime()) / 60000)),
  }));

  return (
    <>
      <EmergencyBar />
      <Header />
      <main id="main" className="mx-auto w-full max-w-[1328px] px-4 pb-20 pt-9 sm:px-8">
        <h1 className="sr-only">Alerts</h1>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <section aria-labelledby="incident-h" className="rounded-2xl bg-alert p-7 text-white sm:p-8">
              <p className="text-[14px] font-semibold uppercase">Active incident · Updated {incident.updatedMinAgo} min ago</p>
              <h2 id="incident-h" className="mt-2 font-display text-[38px] font-bold leading-tight sm:text-[42px]">{incident.name}</h2>
              <p className="mt-4 text-[18px] leading-8">{incident.areas}. {incident.advice}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/board?category=shelter" className="rounded-lg bg-white px-6 py-3.5 text-[16px] font-bold text-[#9a1c14] hover:bg-[#f4e3e1]">Find a shelter</Link>
                <Link href="/request-help" className="rounded-lg border-2 border-white px-6 py-3 text-[16px] font-bold hover:bg-white hover:text-[#9a1c14]">Request help</Link>
              </div>
            </section>
            <div className="mt-6"><AlertFeed alerts={alerts} /></div>
          </div>

          <aside className="rounded-xl border border-line bg-white p-6 lg:sticky lg:top-4">
            <SubscribeForm />
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
