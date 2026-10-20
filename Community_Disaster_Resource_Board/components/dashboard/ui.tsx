import Link from "next/link";

const badge = {
  ok: "bg-ok-soft text-ok", warn: "bg-warn-soft text-[#8a4a0a]", alert: "bg-alert-soft text-alert", neutral: "bg-[#e3e8ee] text-[#3f5163]",
};
export function Badge({ tone, children }: { tone: keyof typeof badge; children: React.ReactNode }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[13px] font-bold ${badge[tone]}`}>{children}</span>;
}

export function Card({ title, aside, children, className = "" }: { title?: string; aside?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-line bg-white p-6 ${className}`}>
      {title && (
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-[24px] font-bold">{title}</h2>
          {aside && <p className="text-[14px] text-muted">{aside}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, note, valueClass = "", noteClass = "text-muted" }: { label: string; value: React.ReactNode; note?: string; valueClass?: string; noteClass?: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <p className="text-[15px] font-semibold text-muted">{label}</p>
      <p className={`mt-1 font-display text-[38px] font-bold leading-none ${valueClass}`}>{value}</p>
      {note && <p className={`mt-3 text-[14px] ${noteClass}`}>{note}</p>}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: { href: string; label: string } }) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-[34px] font-bold leading-tight sm:text-[38px]">{title}</h1>
        <p className="mt-1 text-[16px] text-muted">{subtitle}</p>
      </div>
      {action && (
        <Link href={action.href} className="rounded-lg bg-alert px-6 py-3.5 text-[16px] font-bold text-white hover:brightness-110">{action.label}</Link>
      )}
    </header>
  );
}

export function ComingSoon({ title }: { title: string }) {
  return (
    <Card>
      <h2 className="font-display text-[24px] font-bold">{title}</h2>
      <p className="mt-2 max-w-[520px] text-[16px] leading-7 text-muted">This section isn’t built yet. The overview page has the essentials for now.</p>
    </Card>
  );
}
