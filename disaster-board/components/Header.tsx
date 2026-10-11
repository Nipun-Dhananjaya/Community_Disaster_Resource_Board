"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navItems } from "/lib/data";
import { Icon } from "./Icon";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1328px] items-center justify-between gap-6 px-4 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-navy text-white">
            <Icon name="home" className="size-5" />
          </span>
          <span className="font-display text-[19px] font-bold leading-tight">
            Community Disaster<br />Resource Board
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 text-[16px] font-semibold text-navy-soft lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`border-b-[3px] pb-0.5 pt-1 ${active ? "border-alert text-navy" : "border-transparent hover:border-line"}`}
              >
                {item.label}
              </Link>
            );
          })}
          <label className="flex items-center gap-1">
            <span className="sr-only">Language</span>
            <select defaultValue="en" className="bg-transparent font-semibold">
              <option value="en">EN</option>
              <option value="si">සිං</option>
              <option value="ta">தமி</option>
            </select>
          </label>
          <Link href="/login" className="rounded-lg bg-navy px-4 py-2.5 text-[15px] font-bold text-white hover:bg-navy-soft">
            Log in
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-lg border border-line px-3 py-2 font-semibold lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-line bg-white px-4 pb-4 lg:hidden">
          <ul className="divide-y divide-line">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="block py-3 text-[17px] font-semibold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="py-3">
              <Link href="/login" className="inline-block rounded-lg bg-navy px-5 py-2.5 font-bold text-white">Log in</Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
