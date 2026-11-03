import type { Metadata } from "next";
import { EmergencyBar } from "../../components/EmergencyBar";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { ContactForm } from "../../components/contact/ContactForm";
import { topics, type TopicKey } from "../../lib/contact-topics";
import { Icon } from "../../components/Icon";
import { listings } from "../../lib/listings";

export const metadata: Metadata = { title: "Contact us · Community Disaster Resource Board", description: "Questions, partnerships or feedback." };

const cards = [
  { icon: "!", bg: "bg-alert", title: "Emergency", body: <>Call <a href="tel:119" className="font-bold underline">119</a> for police or <a href="tel:117" className="font-bold underline">117</a> for the disaster hotline. Do not use this form.</> },
  { icon: "@", bg: "bg-navy", title: "General enquiries", body: <><a href="mailto:hello@example.org" className="font-semibold underline">hello@example.org</a> · replies within 2 working days</> },
  { icon: "home", bg: "bg-ok", title: "Partner organizations", body: <>Offer shelters, volunteers or data feeds. We reply in one day.</> },
  { icon: "▲", bg: "bg-warn", title: "Report a problem", body: <>Wrong or unsafe listing? Use Report on that listing for the fastest fix.</> },
] as const;

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string; report?: string }> }) {
  const sp = await searchParams;
  const reported = listings.find((l) => l.id === sp.report);
  const topic: TopicKey = reported ? "feedback" : (topics.find((t) => t.key === sp.topic)?.key ?? "question");
  const message = reported ? `I want to report a problem with the listing “${reported.title}” (${reported.id}):\n\n` : "";

  return (
    <>
      <EmergencyBar />
      <Header activeHref="/" />
      <main id="main" className="mx-auto w-full max-w-[1328px] px-4 pb-20 pt-12 sm:px-8">
        <h1 className="font-display text-[44px] font-bold leading-tight sm:text-[52px]">Contact us</h1>
        <p className="mt-3 max-w-[640px] text-[19px] leading-8 text-muted">Questions, partnerships or feedback are welcome. For anything urgent, call the emergency numbers first.</p>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
          <ul className="space-y-3">
            {cards.map((c) => (
              <li key={c.title} className="flex items-start gap-4 rounded-xl border border-line bg-white p-5">
                <span aria-hidden="true" className={`grid size-10 shrink-0 place-items-center rounded-lg text-[18px] font-bold text-white ${c.bg}`}>{c.icon === "home" ? <Icon name="home" /> : c.icon}</span>
                <div>
                  <h2 className="text-[18px] font-bold">{c.title}</h2>
                  <p className="mt-1 text-[16px] leading-7 text-muted">{c.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <ContactForm initialTopic={topic} initialMessage={message} />
        </div>
      </main>
      <Footer />
    </>
  );
}
