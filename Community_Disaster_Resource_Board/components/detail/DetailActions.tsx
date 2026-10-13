"use client";

import { useEffect, useState } from "react";

const SAVED_KEY = "cdrb-saved";

export function ShareSaveButtons({ id, title }: { id: string; title: string }) {
  const [saved, setSaved] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    try { setSaved((JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]") as string[]).includes(id)); } catch {}
  }, [id]);

  function toggleSave() {
    try {
      const list = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]") as string[];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      setSaved(next.includes(id));
    } catch {}
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setMsg("Link copied");
      }
    } catch {
      setMsg("Couldn’t share. Copy the address from your browser instead.");
    }
  }

  const btn = "rounded-lg border-2 border-navy px-4 py-3 text-[16px] font-bold hover:bg-navy hover:text-white";
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={share} className={btn}>Share</button>
        <button type="button" onClick={toggleSave} aria-pressed={saved} className={`${btn} ${saved ? "bg-navy text-white" : ""}`}>
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      <p role="status" className="sr-only">{msg}</p>
      {msg && <p className="mt-2 text-[14px] text-muted" aria-hidden="true">{msg}</p>}
    </>
  );
}
