"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout, SessionUser } from "../lib/client-auth";
import { menuFor, roleLabel } from "../lib/roles";

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";

export function AccountMenu({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const items = menuFor(user.role, user.orgStatus);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  async function doLogout() {
    setOpen(false);
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 hover:border-navy"
      >
        <span className="grid size-9 place-items-center rounded-full bg-navy text-[14px] font-bold text-white">{initials(user.name)}</span>
        <span aria-hidden="true" className="text-[12px]">▾</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-white shadow-lg">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-[15px] font-bold text-navy">{user.name}</p>
            <p className="text-[13px] font-normal text-muted">{roleLabel[user.role]}</p>
          </div>
          <ul className="py-1">
            {items.map((i) => (
              <li key={i.href} role="none">
                <Link role="menuitem" href={i.href} onClick={() => setOpen(false)} className="block px-4 py-2.5 text-[15px] font-semibold text-navy hover:bg-canvas">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-line py-1">
            <button type="button" role="menuitem" onClick={doLogout} className="block w-full px-4 py-2.5 text-left text-[15px] font-semibold text-alert hover:bg-canvas">
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
