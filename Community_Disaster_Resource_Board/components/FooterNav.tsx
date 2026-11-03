"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/accessibility", label: "Accessibility" },
];

export function FooterNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Footer">
      <ul className="flex flex-wrap gap-x-7 gap-y-2 text-[15px] text-[#c9d6e3]">
        {links.map((l) => {
          const on = pathname === l.href;
          return (
            <li key={l.href}>
              <Link href={l.href} aria-current={on ? "page" : undefined} className={`hover:text-white hover:underline ${on ? "font-bold text-white" : ""}`}>{l.label}</Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
