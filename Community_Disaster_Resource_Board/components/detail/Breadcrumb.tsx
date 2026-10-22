import Link from "next/link";

export function Breadcrumb({ crumbs, current }: { crumbs: { href: string; label: string }[]; current: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-[14px] text-muted">
      <ol className="flex flex-wrap items-center gap-x-2">
        {crumbs.map((c) => (
          <li key={c.href} className="flex items-center gap-2">
            <Link href={c.href} className="hover:underline">{c.label}</Link>
            <span aria-hidden="true">›</span>
          </li>
        ))}
        <li aria-current="page">{current}</li>
      </ol>
    </nav>
  );
}
