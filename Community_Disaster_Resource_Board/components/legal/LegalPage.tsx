import { EmergencyBar } from "../EmergencyBar";
import { Footer } from "../Footer";
import { Header } from "../Header";
import type { LegalDoc } from "../../lib/legal";
import { LegalToc } from "./LegalToc";
import { RichText } from "./RichText";

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <EmergencyBar />
      <Header activeHref="/" />
      <main id="main" className="mx-auto w-full max-w-[1328px] px-4 pb-20 pt-12 sm:px-8">
        <h1 className="font-display text-[44px] font-bold leading-tight sm:text-[52px]">{doc.title}</h1>
        <p className="mt-2 text-[15px] text-muted">Last updated {doc.updated} · Plain-language summary first, full text below</p>

        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-9">
          <LegalToc sections={doc.sections.map((s) => ({ id: s.id, title: s.title }))} pdfHref={`/api/legal/${doc.slug}/pdf`} />
          <article className="rounded-xl border border-line bg-white p-6 sm:p-8">
            <section aria-labelledby="summary-h" className="rounded-xl bg-[#eaf1fb] p-6">
              <h2 id="summary-h" className="font-display text-[26px] font-bold">{doc.summaryTitle}</h2>
              <ul className="mt-3 space-y-1.5 text-[16px]">
                {doc.summary.map((s) => <li key={s}><span aria-hidden="true">✓ </span>{s}</li>)}
              </ul>
            </section>
            {doc.sections.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="mt-9 scroll-mt-6">
                <h2 id={`${s.id}-h`} className="font-display text-[28px] font-bold leading-tight">{i + 1}. {s.title}</h2>
                {s.body.map((p) => <p key={p} className="mt-3 max-w-[780px] text-[16px] leading-8 text-[#33475b]"><RichText text={p} /></p>)}
              </section>
            ))}
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
