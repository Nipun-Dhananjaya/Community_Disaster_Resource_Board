import type { Metadata } from "next";
import { EmergencyBar } from "../../components/EmergencyBar";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { BarrierForm } from "../../components/accessibility/BarrierForm";

export const metadata: Metadata = { title: "Accessibility statement · Community Disaster Resource Board", description: "How we make help reachable for everyone." };

// Wording is kept honest: it describes what the site does today. Edit here when that changes.
const features = [
  { glyph: "Aa", title: "Readable text", text: "Body text is 16 px or larger with high contrast, and the page can be enlarged to 200% without losing content." },
  { glyph: "☐", title: "Large tap targets", text: "Main buttons and links are about 44 px tall so they work with shaky hands or gloves." },
  { glyph: "●", title: "Not just color", text: "Status always shows an icon and a word, such as Available, Limited or Full." },
  { glyph: "⌨", title: "Keyboard friendly", text: "Every page can be used without a mouse, with a visible focus outline." },
  { glyph: "♪", title: "Screen readers", text: "Semantic headings, labels and live regions announce status changes." },
  { glyph: "✎", title: "Languages", text: "English today. Sinhala and Tamil are planned as partners translate." },
  { glyph: "⇩", title: "Low-bandwidth mode", text: "Hides the maps and extra weight for slow connections." },
  { glyph: "☎", title: "Other ways to ask", text: "Call, SMS or ask a volunteer to submit a request for you." },
];
const limits = [
  "Some third-party map tiles have limited screen reader support; every map has a text list alternative.",
  "Uploaded photos may lack descriptions, so we ask senders to add one.",
  "Sign-language video guides are planned, not yet available.",
];

export default function AccessibilityPage() {
  return (
    <>
      <EmergencyBar />
      <Header activeHref="/" />
      <main id="main" className="mx-auto w-full max-w-[1328px] px-4 pb-20 pt-12 sm:px-8">
        <h1 className="font-display text-[44px] font-bold leading-tight sm:text-[52px]">Accessibility statement</h1>
        <p className="mt-3 max-w-[720px] text-[19px] leading-8 text-muted">Help should reach everyone, including people with low vision, hearing loss, limited mobility, little reading time or a weak signal.</p>
        <p className="mt-5 flex flex-wrap items-center gap-4">
          <span className="rounded-full bg-ok-soft px-4 py-2 text-[15px] font-bold text-ok">✓ Target: WCAG 2.1 level AA</span>
          <span className="text-[14px] text-muted">Last reviewed 1 October 2026</span>
        </p>

        <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <li key={f.title} className="rounded-xl border border-line bg-white p-5">
              <span aria-hidden="true" className="grid size-10 place-items-center rounded-lg bg-navy text-[17px] font-bold text-white">{f.glyph}</span>
              <h2 className="mt-4 text-[18px] font-bold">{f.title}</h2>
              <p className="mt-2 text-[16px] leading-7 text-muted">{f.text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section aria-labelledby="limits-h" className="rounded-xl border border-line bg-white p-6 sm:p-7">
            <h2 id="limits-h" className="font-display text-[30px] font-bold">Known limitations</h2>
            <ul className="mt-3 space-y-3 text-[16px] leading-7">
              {limits.map((l) => <li key={l}><span aria-hidden="true">▲ </span>{l}</li>)}
            </ul>
          </section>
          <section className="rounded-xl border border-line bg-white p-6 sm:p-7"><BarrierForm /></section>
        </div>
      </main>
      <Footer />
    </>
  );
}
