"use client";

import { useEffect, useState } from "react";

export function LegalToc({ sections, pdfHref }: { sections: { id: string; title: string }[]; pdfHref: string }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => { const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (hit) setActive(hit.target.id); },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  return (
    <nav aria-label="On this page" className="rounded-xl border border-line bg-white p-5 lg:sticky lg:top-4">
      <p className="text-[14px] font-bold text-muted">On this page</p>
      <ol className="mt-3 border-l-2 border-line">
        {sections.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? "location" : undefined}
              onClick={() => setActive(s.id)}
              className={`-ml-[2px] block border-l-[3px] py-2.5 pl-4 pr-2 text-[16px] ${active === s.id ? "border-alert font-bold text-navy" : "border-transparent font-semibold text-muted hover:text-navy"}`}
            >
              {i + 1}. {s.title}
            </a>
          </li>
        ))}
      </ol>
      <a href={pdfHref} download className="mt-5 block rounded-lg border-2 border-navy py-3 text-center text-[15px] font-bold hover:bg-navy hover:text-white">Download PDF</a>
    </nav>
  );
}
