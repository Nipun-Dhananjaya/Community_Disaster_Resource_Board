"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "../../lib/client-auth";

export function SideNavLink({ href, label, exact }: { href: string; label: string; exact?: boolean }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`whitespace-nowrap rounded-lg px-5 py-3 text-[16px] font-semibold ${active ? "bg-[#27496a] text-white" : "text-[#c9d6e3] hover:bg-[#1d3b5a] hover:text-white"}`}
    >
      {label}
    </Link>
  );
}

export function SideLogout() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => { await logout(); router.push("/"); router.refresh(); }}
      className="rounded-lg px-5 py-3 text-left text-[15px] font-semibold text-[#c9d6e3] hover:bg-[#1d3b5a] hover:text-white"
    >
      Log out
    </button>
  );
}
