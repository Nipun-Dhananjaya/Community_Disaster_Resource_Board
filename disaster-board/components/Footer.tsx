import Link from "next/link";
import { LowBandwidthToggle } from "./LowBandwidthToggle";

const links = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/accessibility", label: "Accessibility" },
];

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto flex max-w-[1328px] flex-wrap items-center justify-between gap-4 px-4 py-9 sm:px-8">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-7 gap-y-2 text-[15px] text-[#c9d6e3]">
            {links.map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:text-white hover:underline">{l.label}</Link></li>
            ))}
          </ul>
        </nav>
        <LowBandwidthToggle />
      </div>
    </footer>
  );
}
